"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

interface Issue {
  id: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;
}

const priorityStyles: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-700",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-red-100 text-red-700",
};

const statusStyles: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-purple-100 text-purple-700",
  RESOLVED: "bg-green-100 text-green-700",
};

export default function IssuesPage() {
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadIssues();
  }, []);

  async function loadIssues() {
    try {
      const data = await apiRequest<{ issues: Issue[] }>("/api/issues");
      setIssues(data.issues);
    } catch (err) {
      // If unauthorized, send them to login instead of showing an error
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await apiRequest("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Loading...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Your issues</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Log out
        </button>
      </div>

      <Link
        href="/issues/new"
        className="inline-block bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-blue-700 mb-6"
      >
        + New issue
      </Link>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {issues.length === 0 ? (
        <p className="text-gray-500">No issues yet. Create your first one.</p>
      ) : (
        <ul className="space-y-3">
          {issues.map((issue) => (
            <li key={issue.id}>
              <Link
                href={`/issues/${issue.id}`}
                className="block border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-medium">{issue.title}</h2>
                  <div className="flex gap-2 shrink-0">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${priorityStyles[issue.priority]}`}
                    >
                      {issue.priority}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${statusStyles[issue.status]}`}
                    >
                      {issue.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                  {issue.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}