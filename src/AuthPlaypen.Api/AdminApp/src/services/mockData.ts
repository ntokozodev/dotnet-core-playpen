import type { Application, Scope } from "@/types/models";

const defaultMetadata = {
  createdBy: "mock-system",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedBy: "mock-system",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

export const mockApplications = (): Application[] => [
  {
    id: "1",
    displayName: "Admin Portal",
    clientId: "admin-portal-client",
    clientSecret: "********",
    scopes: [
      { id: "1", displayName: "Read Users", scopeName: "users.read", description: "Allows reading user information" },
      { id: "2", displayName: "Write Users", scopeName: "users.write", description: "Allows creating and updating users" },
      { id: "4", displayName: "Read Audit Logs", scopeName: "audit.read", description: "Allows reading security and audit logs" },
      { id: "6", displayName: "Manage Roles", scopeName: "roles.manage", description: "Allows managing user roles" },
    ],
    flow: "AuthorizationWithPKCE",
    redirectUris: "https://admin.local/callback",
    postLogoutRedirectUris: "https://admin.local/logout",
    metadata: defaultMetadata,
  },
  {
    id: "2",
    displayName: "Mobile App",
    clientId: "mobile-client",
    clientSecret: "********",
    scopes: [
      { id: "1", displayName: "Read Users", scopeName: "users.read", description: "Allows reading user information" },
      { id: "3", displayName: "Read Reports", scopeName: "reports.read", description: "Allows viewing reports" },
      { id: "7", displayName: "Read Notifications", scopeName: "notifications.read", description: "Allows reading user notifications" },
    ],
    flow: "AuthorizationWithPKCE",
    redirectUris: "myapp://callback",
    metadata: defaultMetadata,
  },
  {
    id: "3",
    displayName: "Reporting Service",
    clientId: "reporting-service-client",
    clientSecret: "********",
    scopes: [
      { id: "3", displayName: "Read Reports", scopeName: "reports.read", description: "Allows viewing reports" },
      { id: "8", displayName: "Write Reports", scopeName: "reports.write", description: "Allows creating and updating reports" },
      { id: "4", displayName: "Read Audit Logs", scopeName: "audit.read", description: "Allows reading security and audit logs" },
    ],
    flow: "ClientCredentials",
    metadata: defaultMetadata,
  },
  {
    id: "4",
    displayName: "Partner API",
    clientId: "partner-api-client",
    clientSecret: "********",
    scopes: [
      { id: "9", displayName: "Partner Data Read", scopeName: "partner.data.read", description: "Allows reading partner data" },
      { id: "10", displayName: "Partner Data Write", scopeName: "partner.data.write", description: "Allows writing partner data" },
    ],
    flow: "ClientCredentials",
    metadata: defaultMetadata,
  },
  {
    id: "5",
    displayName: "Backoffice Dashboard",
    clientId: "backoffice-dashboard-client",
    clientSecret: "********",
    scopes: [
      { id: "1", displayName: "Read Users", scopeName: "users.read", description: "Allows reading user information" },
      { id: "2", displayName: "Write Users", scopeName: "users.write", description: "Allows creating and updating users" },
      { id: "5", displayName: "Delete Users", scopeName: "users.delete", description: "Allows deleting users" },
      { id: "6", displayName: "Manage Roles", scopeName: "roles.manage", description: "Allows managing user roles" },
    ],
    flow: "AuthorizationWithPKCE",
    redirectUris: "https://backoffice.local/callback",
    postLogoutRedirectUris: "https://backoffice.local/logout",
    metadata: defaultMetadata,
  },
  {
    id: "6",
    displayName: "Notifications Worker",
    clientId: "notifications-worker-client",
    clientSecret: "********",
    scopes: [
      { id: "7", displayName: "Read Notifications", scopeName: "notifications.read", description: "Allows reading user notifications" },
      { id: "11", displayName: "Send Notifications", scopeName: "notifications.send", description: "Allows sending notifications" },
    ],
    flow: "ClientCredentials",
    metadata: defaultMetadata,
  },
];

export const MockScopes = (): Scope[] => [
  { id: "1", displayName: "Read Users", scopeName: "users.read", description: "Allows reading user information", applications: [], metadata: defaultMetadata },
  { id: "2", displayName: "Write Users", scopeName: "users.write", description: "Allows creating and updating users", applications: [], metadata: defaultMetadata },
  { id: "3", displayName: "Read Reports", scopeName: "reports.read", description: "Allows viewing reports", applications: [], metadata: defaultMetadata },
  { id: "4", displayName: "Read Audit Logs", scopeName: "audit.read", description: "Allows reading security and audit logs", applications: [], metadata: defaultMetadata },
  { id: "5", displayName: "Delete Users", scopeName: "users.delete", description: "Allows deleting users", applications: [], metadata: defaultMetadata },
  { id: "6", displayName: "Manage Roles", scopeName: "roles.manage", description: "Allows managing user roles", applications: [], metadata: defaultMetadata },
  { id: "7", displayName: "Read Notifications", scopeName: "notifications.read", description: "Allows reading user notifications", applications: [], metadata: defaultMetadata },
  { id: "8", displayName: "Write Reports", scopeName: "reports.write", description: "Allows creating and updating reports", applications: [], metadata: defaultMetadata },
  { id: "9", displayName: "Partner Data Read", scopeName: "partner.data.read", description: "Allows reading partner data", applications: [], metadata: defaultMetadata },
  { id: "10", displayName: "Partner Data Write", scopeName: "partner.data.write", description: "Allows writing partner data", applications: [], metadata: defaultMetadata },
  { id: "11", displayName: "Send Notifications", scopeName: "notifications.send", description: "Allows sending notifications", applications: [], metadata: defaultMetadata },
];
