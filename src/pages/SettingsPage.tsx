export function SettingsPage() {
  return (
    <div className="flex h-full flex-col bg-[#050509]">
      <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-10 sm:py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-2xl font-semibold text-gray-200">
            Settings
          </h1>
          <div className="space-y-6">
            <div className="rounded-xl border border-white/10 bg-black/40 p-6">
              <h2 className="mb-4 text-lg font-medium text-gray-200">
                Appearance
              </h2>
              <p className="text-sm text-gray-400">
                Theme settings coming soon...
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/40 p-6">
              <h2 className="mb-4 text-lg font-medium text-gray-200">
                Account
              </h2>
              <p className="text-sm text-gray-400">
                Account settings coming soon...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

