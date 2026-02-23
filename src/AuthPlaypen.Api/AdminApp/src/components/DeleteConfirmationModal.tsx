import { createSignal, Show } from "solid-js";

type DeleteConfirmationModalProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
};

export function DeleteConfirmationModal(props: DeleteConfirmationModalProps) {
  const [confirmationText, setConfirmationText] = createSignal("");

  const closeModal = () => {
    setConfirmationText("");
    props.onCancel();
  };

  const confirmDelete = () => {
    props.onConfirm();
    setConfirmationText("");
  };

  return (
    <Show when={props.isOpen}>
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
        <div class="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-xl">
          <h2 class="text-lg font-semibold text-slate-900">{props.title}</h2>
          <p class="text-sm text-slate-700">{props.description}</p>
          <label class="block">
            <span class="text-sm text-slate-700">Type <span class="font-semibold">delete</span> to confirm</span>
            <input
              class="mt-1 w-full rounded border p-2"
              value={confirmationText()}
              onInput={(e) => setConfirmationText(e.currentTarget.value)}
              placeholder="delete"
            />
          </label>
          <div class="flex justify-end gap-2">
            <button class="rounded border border-slate-300 px-3 py-2 text-sm" type="button" onClick={closeModal}>
              Cancel
            </button>
            <button
              class="rounded bg-red-700 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              disabled={confirmationText() !== "delete" || props.isDeleting}
              onClick={confirmDelete}
            >
              {props.isDeleting ? "Deleting..." : props.confirmLabel ?? "Delete"}
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
}
