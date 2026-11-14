import { Check, Copy, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ConnectMuseCard() {
  const [url, setUrl] = useState("/mcp");
  const [copied, setCopied] = useState(false);
  useEffect(() => { setUrl(new URL("/mcp", window.location.origin).toString()); }, []);
  const setup = `Create a Custom Connector for a new remote MCP server, then connect to it: Name: Sahayak. Transport: remote streamable HTTP. URL: ${url}. Auth: OAuth 2.1. Complete the participant sign-in and consent prompt, then list its tools.`;

  async function copy() {
    await navigator.clipboard.writeText(setup);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div><h2 className="font-heading text-base font-semibold text-primary">Connect Muse</h2><p className="mt-1 text-sm text-muted-foreground">Optional. Muse uses your participant sign-in and can only access your own records.</p></div>
        <ExternalLink className="size-5 shrink-0 text-purple" aria-hidden />
      </div>
      <label htmlFor="muse-setup" className="mt-4 block text-xs font-medium text-muted-foreground">Setup message for your Muse agent</label>
      <Textarea id="muse-setup" readOnly value={setup} rows={6} className="mt-1 bg-background" />
      <Button variant="outline" className="mt-3" onClick={copy}>{copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}{copied ? "Copied" : "Copy setup message"}</Button>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">The server URL is <span className="font-medium text-primary">{url}</span>. Publish the app before using it from an external assistant.</p>
    </section>
  );
}
