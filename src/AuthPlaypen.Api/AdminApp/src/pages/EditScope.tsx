import { useNavigate, useParams } from "@solidjs/router";
import { createEffect, createSignal } from "solid-js";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { MultiSelect } from "@/components/MultiSelect";
import { useApplications } from "@/queries/applicationQueries";
import { useDeleteScope, useScopes, useUpdateScope } from "@/queries/scopeQueries";
import { mapSelectionToIds } from "@/utils/selection";

export function EditScope() {
  const params = useParams();
  const navigate = useNavigate();
  const scopes = useScopes();
  const apps = useApplications();
  const update = useUpdateScope();
  const remove = useDeleteScope();

  const [displayName, setDisplayName] = createSignal("");
  const [scopeName, setScopeName] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [selectedAppIds, setSelectedAppIds] = createSignal<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = createSignal(false);

  const selectedScope = () => scopes.data?.find((s) => s.id === params.id);

  createEffect(() => {
    const scope = selectedScope();
    if (!scope) return;
    setDisplayName(scope.displayName);
    setScopeName(scope.scopeName);
    setDescription(scope.description);
    setSelectedAppIds(scope.applications.map((a) => a.id));
  });

  return (
    <div class="space-y-4">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { href: "/scopes", label: "Scopes" }, { label: "Edit Scope" }]} />
      <h1 class="text-2xl font-semibold">Edit Scope</h1>
      <label class="block">
        <span class="text-sm">Display Name</span>
        <input class="mt-1 w-full rounded border p-2" value={displayName()} onInput={(e) => setDisplayName(e.currentTarget.value)} />
      </label>
      <label class="block">
        <span class="text-sm">Scope Name</span>
        <input class="mt-1 w-full rounded border p-2" value={scopeName()} onInput={(e) => setScopeName(e.currentTarget.value)} />
      </label>
      <label class="block">
        <span class="text-sm">Description</span>
        <input class="mt-1 w-full rounded border p-2" value={description()} onInput={(e) => setDescription(e.currentTarget.value)} />
      </label>
      <MultiSelect
        label="Applications"
        options={(apps.data ?? []).map((a) => ({ id: a.id, label: `${a.displayName} (${a.clientId})` }))}
        selected={selectedAppIds()}
        onChange={setSelectedAppIds}
      />
      <button
        class="rounded bg-blue-700 px-3 py-2 text-white"
        onClick={() => {
          const scope = selectedScope();
          if (!scope) return;
          update.mutate({
            id: scope.id,
            payload: {
              displayName: displayName(),
              scopeName: scopeName(),
              description: description(),
              applicationIds: mapSelectionToIds(selectedAppIds(), (apps.data ?? []).map((app) => app.id)),
            },
          });
        }}
      >
        Save
      </button>
      <button class="rounded bg-red-700 px-3 py-2 text-white" type="button" onClick={() => setShowDeleteModal(true)}>
        Delete Scope
      </button>
      <DeleteConfirmationModal
        isOpen={showDeleteModal()}
        title="Delete scope"
        description="This will permanently remove the scope and clear it from linked applications."
        isDeleting={remove.isPending}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={() => {
          const scope = selectedScope();
          if (!scope) return;
          remove.mutate(scope.id, {
            onSuccess: () => navigate("/scopes"),
          });
          setShowDeleteModal(false);
        }}
      />
    </div>
  );
}
