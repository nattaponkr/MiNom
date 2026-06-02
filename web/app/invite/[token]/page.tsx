import InviteAccept from "@/components/InviteAccept";

// Next 15: route params are async.
export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <InviteAccept token={token} />;
}
