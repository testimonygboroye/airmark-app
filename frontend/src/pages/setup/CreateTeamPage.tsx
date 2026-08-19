import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { apiClient } from "@/lib/apiClient";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function CreateTeamPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await apiClient.post("/teams", { name });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Couldn't create the team.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Card>
        <h1 className="font-display text-xl font-semibold mb-1">Create a team</h1>
        <p className="text-sm text-standby-slate mb-6">
          You'll be set as Team Owner with full control.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Team name"
            required
            placeholder="e.g. House on the Rock Media Team"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {error && <p className="text-sm text-signal-red">{error}</p>}
          <Button type="submit" isLoading={isLoading}>
            Create team
          </Button>
        </form>
      </Card>
    </div>
  );
}
