using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using OpenIddict.Abstractions;
using OpenIddict.Server.AspNetCore;

namespace AuthPlaypen.Api.Controllers;

[ApiController]
[Route("connect")]
public class ConnectController(
    IOpenIddictApplicationManager applicationManager,
    IAuthenticationSchemeProvider schemeProvider) : ControllerBase
{
    private const string ExternalCookieScheme = "AuthPlaypenCookie";
    private const string AzureAdOidcScheme = "AzureAdOidc";

    [HttpGet("authorize")]
    [HttpPost("authorize")]
    public async Task<IActionResult> Authorize(CancellationToken cancellationToken)
    {
        var request = HttpContext.GetOpenIddictServerRequest()
            ?? throw new InvalidOperationException("The OpenID Connect request cannot be retrieved.");

        var cookieAuthResult = await HttpContext.AuthenticateAsync(ExternalCookieScheme);
        if (!cookieAuthResult.Succeeded)
        {
            var azureScheme = await schemeProvider.GetSchemeAsync(AzureAdOidcScheme);
            if (azureScheme is null)
            {
                return Problem(
                    title: "Azure OIDC is not configured",
                    detail: "Configure AzureAd:TenantId, AzureAd:ClientId and AzureAd:ClientSecret to enable PKCE/authorization code sign-in.",
                    statusCode: StatusCodes.Status500InternalServerError);
            }

            return Challenge(AzureAdOidcScheme, new AuthenticationProperties
            {
                RedirectUri = Request.PathBase + Request.Path + Request.QueryString
            });
        }

        var clientId = request.ClientId;
        if (string.IsNullOrWhiteSpace(clientId))
        {
            return BadRequest(new OpenIddictResponse
            {
                Error = OpenIddictConstants.Errors.InvalidClient,
                ErrorDescription = "client_id is required."
            });
        }

        var application = await applicationManager.FindByClientIdAsync(clientId, cancellationToken);
        if (application is null)
        {
            return BadRequest(new OpenIddictResponse
            {
                Error = OpenIddictConstants.Errors.InvalidClient,
                ErrorDescription = "The client application cannot be found."
            });
        }

        var permissions = await applicationManager.GetPermissionsAsync(application, cancellationToken);
        var allowsAuthorizationCode = permissions.Contains(OpenIddictConstants.Permissions.GrantTypes.AuthorizationCode, StringComparer.Ordinal);
        if (!allowsAuthorizationCode)
        {
            return BadRequest(new OpenIddictResponse
            {
                Error = OpenIddictConstants.Errors.UnauthorizedClient,
                ErrorDescription = "This client is not configured for authorization code flow."
            });
        }

        var allowedScopes = permissions
            .Where(permission => permission.StartsWith(OpenIddictConstants.Permissions.Prefixes.Scope, StringComparison.Ordinal))
            .Select(permission => permission[OpenIddictConstants.Permissions.Prefixes.Scope.Length..])
            .Where(scopeName => !string.IsNullOrWhiteSpace(scopeName))
            .ToHashSet(StringComparer.Ordinal);

        var requestedScopes = request.GetScopes().ToArray();
        var grantedScopes = requestedScopes.Length == 0
            ? allowedScopes.ToArray()
            : requestedScopes.Where(allowedScopes.Contains).ToArray();

        if (requestedScopes.Length > 0 && grantedScopes.Length != requestedScopes.Length)
        {
            return BadRequest(new OpenIddictResponse
            {
                Error = OpenIddictConstants.Errors.InvalidScope,
                ErrorDescription = "One or more requested scopes are not allowed for this client."
            });
        }

        if (grantedScopes.Length == 0)
        {
            return BadRequest(new OpenIddictResponse
            {
                Error = OpenIddictConstants.Errors.InvalidScope,
                ErrorDescription = "No scopes are assigned to this client."
            });
        }

        var sourcePrincipal = cookieAuthResult.Principal!;
        var subject = sourcePrincipal.FindFirst(OpenIddictConstants.Claims.Subject)?.Value
            ?? sourcePrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? sourcePrincipal.FindFirst("oid")?.Value;

        if (string.IsNullOrWhiteSpace(subject))
        {
            return BadRequest(new OpenIddictResponse
            {
                Error = OpenIddictConstants.Errors.InvalidRequest,
                ErrorDescription = "Authenticated user subject is missing."
            });
        }

        var identity = new ClaimsIdentity(
            TokenValidationParameters.DefaultAuthenticationType,
            OpenIddictConstants.Claims.Name,
            OpenIddictConstants.Claims.Role);

        identity.SetClaim(OpenIddictConstants.Claims.Subject, subject);

        var displayName = sourcePrincipal.Identity?.Name;
        if (!string.IsNullOrWhiteSpace(displayName))
        {
            identity.SetClaim(OpenIddictConstants.Claims.Name, displayName);
        }

        identity.SetScopes(grantedScopes);
        identity.SetDestinations(static claim => claim.Type switch
        {
            OpenIddictConstants.Claims.Name =>
                [OpenIddictConstants.Destinations.AccessToken, OpenIddictConstants.Destinations.IdentityToken],
            _ => [OpenIddictConstants.Destinations.AccessToken]
        });

        return SignIn(new ClaimsPrincipal(identity), OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
    }

    [HttpPost("token")]
    public async Task<IActionResult> Token(CancellationToken cancellationToken)
    {
        var request = HttpContext.GetOpenIddictServerRequest()
            ?? throw new InvalidOperationException("The OpenID Connect request cannot be retrieved.");

        if (request.IsAuthorizationCodeGrantType() || request.IsRefreshTokenGrantType())
        {
            var authenticateResult = await HttpContext.AuthenticateAsync(OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
            if (!authenticateResult.Succeeded || authenticateResult.Principal is null)
            {
                return BadRequest(new OpenIddictResponse
                {
                    Error = OpenIddictConstants.Errors.InvalidGrant,
                    ErrorDescription = "The authorization code or refresh token is invalid."
                });
            }

            return SignIn(authenticateResult.Principal, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
        }

        if (!request.IsClientCredentialsGrantType())
        {
            return BadRequest(new OpenIddictResponse
            {
                Error = OpenIddictConstants.Errors.UnsupportedGrantType,
                ErrorDescription = "Only client_credentials and authorization_code flows are supported."
            });
        }

        var clientId = request.ClientId;
        var clientSecret = request.ClientSecret;

        if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret))
        {
            return BadRequest(new OpenIddictResponse
            {
                Error = OpenIddictConstants.Errors.InvalidClient,
                ErrorDescription = "client_id and client_secret are required."
            });
        }

        var application = await applicationManager.FindByClientIdAsync(clientId, cancellationToken);
        if (application is null)
        {
            return BadRequest(new OpenIddictResponse
            {
                Error = OpenIddictConstants.Errors.InvalidClient,
                ErrorDescription = "Client authentication failed."
            });
        }

        var isValidClientSecret = await applicationManager.ValidateClientSecretAsync(application, clientSecret, cancellationToken);
        if (!isValidClientSecret)
        {
            return BadRequest(new OpenIddictResponse
            {
                Error = OpenIddictConstants.Errors.InvalidClient,
                ErrorDescription = "Client authentication failed."
            });
        }

        var permissions = await applicationManager.GetPermissionsAsync(application, cancellationToken);
        var allowsClientCredentials = permissions.Contains(OpenIddictConstants.Permissions.GrantTypes.ClientCredentials, StringComparer.Ordinal);
        if (!allowsClientCredentials)
        {
            return BadRequest(new OpenIddictResponse
            {
                Error = OpenIddictConstants.Errors.UnauthorizedClient,
                ErrorDescription = "This client is not configured for the client credentials flow."
            });
        }

        var issuedScopes = permissions
            .Where(permission => permission.StartsWith(OpenIddictConstants.Permissions.Prefixes.Scope, StringComparison.Ordinal))
            .Select(permission => permission[OpenIddictConstants.Permissions.Prefixes.Scope.Length..])
            .Where(scopeName => !string.IsNullOrWhiteSpace(scopeName))
            .Distinct(StringComparer.Ordinal)
            .ToArray();

        if (issuedScopes.Length == 0)
        {
            return BadRequest(new OpenIddictResponse
            {
                Error = OpenIddictConstants.Errors.InvalidScope,
                ErrorDescription = "No scopes are assigned to this client."
            });
        }

        var displayName = await applicationManager.GetDisplayNameAsync(application, cancellationToken);

        var identity = new ClaimsIdentity(
            TokenValidationParameters.DefaultAuthenticationType,
            OpenIddictConstants.Claims.Name,
            OpenIddictConstants.Claims.Role);

        identity.SetClaim(OpenIddictConstants.Claims.Subject, clientId);
        identity.SetClaim("client_id", clientId);

        if (!string.IsNullOrWhiteSpace(displayName))
        {
            identity.SetClaim(OpenIddictConstants.Claims.Name, displayName);
        }

        identity.SetScopes(issuedScopes);
        identity.SetDestinations(static claim => [OpenIddictConstants.Destinations.AccessToken]);

        return SignIn(new ClaimsPrincipal(identity), OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
    }
}
