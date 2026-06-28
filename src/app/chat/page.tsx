import ChatInterface from "@/components/ChatInterface";

const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

export default function ChatPage() {
  if (isStaticExport) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="max-w-md text-center px-6" role="status">
          <p className="text-lg font-semibold mb-2">AI Chat Unavailable</p>
          <p className="text-sm text-[var(--text-secondary)]">
            The AI tutor requires a server and is not available in this
            statically hosted edition. Run the app locally with{" "}
            <code className="px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-xs">
              pnpm dev
            </code>{" "}
            to use chat.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ChatInterface />
    </div>
  );
}
