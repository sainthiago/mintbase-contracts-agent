import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col p-2">
      <h1 className="text-3xl font-bold">Mintbase Contracts Agent</h1>
      <ul>
        <li>
          <a
            href="https://docs.mintbase.xyz/ai/mintbase-plugins"
            target="_blank"
            rel="noreferrer"
          >
            Docs
          </a>
        </li>
        <li>
          <Link href="/.well-known/ai-plugin.json">OpenAPI Spec</Link>
        </li>
        <li>
          <a
            href="https://github.com/sainthiago/mintbase-contracts-agent"
            target="_blank"
            rel="noreferrer"
          >
            Source Code
          </a>
        </li>
      </ul>
    </main>
  );
}
