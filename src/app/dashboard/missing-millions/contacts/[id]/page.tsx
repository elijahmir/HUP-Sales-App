"use client";

/**
 * Missing Millions — Contact Detail Page
 * Shows contact info, editable fields, notes log, and tasks.
 */

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type {
  Contact,
  PipelineStage,
  Note,
  NoteType,
  Task,
} from "@/lib/missing-millions/types";
import StatusBadge from "@/components/missing-millions/StatusBadge";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
} from "lucide-react";

export default function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [contact, setContact] = useState<Contact | null>(null);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New note form
  const [newNoteType, setNewNoteType] = useState<NoteType>("general");
  const [newNoteContent, setNewNoteContent] = useState("");

  // New task form
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskDue, setNewTaskDue] = useState("");

  useEffect(() => {
    async function loadData() {
      const [contactRes, stagesRes, notesRes, tasksRes] =
        await Promise.all([
          supabase
            .from("sales_contacts")
            .select("*, pipeline_stage:sales_pipeline_stages(*)")
            .eq("id", id)
            .single(),
          supabase
            .from("sales_pipeline_stages")
            .select("*")
            .order("order_num"),
          supabase
            .from("sales_notes")
            .select("*")
            .eq("contact_id", id)
            .order("created_at", { ascending: false }),
          supabase
            .from("sales_tasks")
            .select("*")
            .eq("contact_id", id)
            .order("due_date", { ascending: true }),
        ]);

      if (contactRes.data) setContact(contactRes.data);
      if (stagesRes.data) setStages(stagesRes.data);
      if (notesRes.data) setNotes(notesRes.data);
      if (tasksRes.data) setTasks(tasksRes.data);
      setLoading(false);
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateContact = async (updates: Partial<Contact>) => {
    setSaving(true);
    await supabase
      .from("sales_contacts")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);
    setContact((prev) => (prev ? { ...prev, ...updates } : prev));
    setSaving(false);
  };

  const addNote = async () => {
    if (!newNoteContent.trim()) return;
    const { data } = await supabase
      .from("sales_notes")
      .insert({
        contact_id: id,
        type: newNoteType,
        content: newNoteContent.trim(),
        author: "System",
      })
      .select()
      .single();
    if (data) {
      setNotes([data, ...notes]);
      setNewNoteContent("");

      // Update last_contacted_at
      await updateContact({
        last_contacted_at: new Date().toISOString(),
      });
    }
  };

  const addTask = async () => {
    if (!newTaskDesc.trim()) return;
    const { data } = await supabase
      .from("sales_tasks")
      .insert({
        contact_id: id,
        description: newTaskDesc.trim(),
        due_date: newTaskDue || null,
      })
      .select()
      .single();
    if (data) {
      setTasks([...tasks, data]);
      setNewTaskDesc("");
      setNewTaskDue("");
    }
  };

  const toggleTask = async (task: Task) => {
    const newStatus =
      task.status === "pending" ? "completed" : "pending";
    await supabase
      .from("sales_tasks")
      .update({
        status: newStatus,
        completed_at:
          newStatus === "completed" ? new Date().toISOString() : null,
      })
      .eq("id", task.id);
    setTasks(
      tasks.map((t) =>
        t.id === task.id ? { ...t, status: newStatus } : t,
      ),
    );
  };

  const deleteContact = async () => {
    if (
      !window.confirm(
        "Delete this contact and all related notes/tasks?",
      )
    )
      return;
    await supabase.from("sales_contacts").delete().eq("id", id);
    router.push("/dashboard/missing-millions/contacts");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ADEF]" />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Contact not found.</p>
        <Link
          href="/dashboard/missing-millions/contacts"
          className="text-[#00ADEF] hover:underline text-sm mt-2 inline-block"
        >
          ← Back to Contacts
        </Link>
      </div>
    );
  }

  const NOTE_TYPES: { value: NoteType; label: string }[] = [
    { value: "call", label: "📞 Call" },
    { value: "sms", label: "💬 SMS" },
    { value: "email", label: "📧 Email" },
    { value: "meeting", label: "🤝 Meeting" },
    { value: "appraisal", label: "📋 Appraisal" },
    { value: "general", label: "📝 General" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/missing-millions/contacts"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Contacts
        </Link>
        <button
          type="button"
          onClick={deleteContact}
          className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
          title="Delete contact"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Contact Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {contact.name}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              {contact.phone && (
                <span className="flex items-center gap-1 text-sm text-slate-600">
                  <Phone className="w-3.5 h-3.5" /> {contact.phone}
                </span>
              )}
              {contact.email && (
                <span className="flex items-center gap-1 text-sm text-slate-600">
                  <Mail className="w-3.5 h-3.5" /> {contact.email}
                </span>
              )}
            </div>
          </div>
          {contact.pipeline_stage && (
            <StatusBadge value={contact.pipeline_stage.name} />
          )}
        </div>

        {/* Editable Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Pipeline Stage
            </label>
            <select
              value={contact.pipeline_stage_id || ""}
              onChange={(e) =>
                updateContact({
                  pipeline_stage_id: e.target.value || null,
                })
              }
              className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg bg-white"
            >
              <option value="">None</option>
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Assigned Agent
            </label>
            <input
              type="text"
              value={contact.assigned_agent || ""}
              onChange={(e) =>
                updateContact({ assigned_agent: e.target.value })
              }
              className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg"
              placeholder="Agent name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Next Follow-up
            </label>
            <input
              type="date"
              value={
                contact.next_follow_up_at
                  ? contact.next_follow_up_at.split("T")[0]
                  : ""
              }
              onChange={(e) =>
                updateContact({
                  next_follow_up_at: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : null,
                })
              }
              className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg"
            />
          </div>
        </div>
        {saving && (
          <p className="text-xs text-[#00ADEF] mt-2 flex items-center gap-1">
            <Save className="w-3 h-3" /> Saving...
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notes */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-400" />
            Notes
          </h3>

          {/* Add Note */}
          <div className="space-y-3 mb-6">
            <div className="flex gap-2">
              <select
                value={newNoteType}
                onChange={(e) =>
                  setNewNoteType(e.target.value as NoteType)
                }
                className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
              >
                {NOTE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Add a note..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#00ADEF]/20 focus:border-[#00ADEF]"
            />
            <button
              type="button"
              onClick={addNote}
              disabled={!newNoteContent.trim()}
              className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              + Add Note
            </button>
          </div>

          {/* Notes List */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {notes.length === 0 ? (
              <p className="text-sm text-slate-400 italic text-center py-4">
                No notes yet.
              </p>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className="border border-slate-100 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-500 uppercase">
                      {
                        NOTE_TYPES.find((t) => t.value === note.type)
                          ?.label
                      }
                    </span>
                    <span className="text-xs text-slate-400">
                      {note.created_at
                        ? new Date(
                            note.created_at,
                          ).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">
                    {note.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
            Tasks
          </h3>

          {/* Add Task */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTaskDesc}
              onChange={(e) => setNewTaskDesc(e.target.value)}
              placeholder="New task..."
              className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ADEF]/20"
            />
            <input
              type="date"
              value={newTaskDue}
              onChange={(e) => setNewTaskDue(e.target.value)}
              className="px-2 py-1.5 text-sm border border-slate-200 rounded-lg"
            />
            <button
              type="button"
              onClick={addTask}
              disabled={!newTaskDesc.trim()}
              className="bg-slate-900 text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Tasks List */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {tasks.length === 0 ? (
              <p className="text-sm text-slate-400 italic text-center py-4">
                No tasks yet.
              </p>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                    task.status === "completed"
                      ? "border-emerald-100 bg-emerald-50/50"
                      : "border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleTask(task)}
                    className="mt-0.5 shrink-0"
                  >
                    {task.status === "completed" ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${task.status === "completed" ? "text-slate-400 line-through" : "text-slate-700"}`}
                    >
                      {task.description}
                    </p>
                    {task.due_date && (
                      <p
                        className={`text-xs mt-0.5 ${
                          task.status === "pending" &&
                          new Date(task.due_date) < new Date()
                            ? "text-red-500 font-medium"
                            : "text-slate-400"
                        }`}
                      >
                        Due:{" "}
                        {new Date(
                          task.due_date,
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
