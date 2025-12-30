import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/useTheme';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../context/useAuth';
import { PromptTemplate } from '../types';
import { mapSessionRow } from '../utils/dbMappers';
import promptTemplatesData from '../data/promptTemplates.json';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { MoreHorizontal, FileText } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter // Import DialogFooter
  } from "./ui/dialog"

const promptTemplates: PromptTemplate[] = promptTemplatesData as PromptTemplate[];

interface TableRowData {
  id: string;
  title: string;
  date: string;
  time: string;
  model: string;
  template: string;
  userMessageContent: string;
  aiMessageContent?: string; // AI message content is optional
}


const AIHistoryPage: React.FC = () => {
    const { isDarkTheme } = useTheme();
    const [tableData, setTableData] = useState<TableRowData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const userId = user?.id;

    // State for dialog
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogContent, setDialogContent] = useState("");
    const [dialogTitle, setDialogTitle] = useState("");

    useEffect(() => {
        const fetchChatSessions = async () => {
            if (!userId) {
                console.log("User ID not available yet.");
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const query = supabase
                    .from('sessions')
                    .select(`
                        id,
                        created_at,
                        title,
                        user_id,
                        messages (
                            id,
                            content,
                            role,
                            created_at,
                            model,
                            session_id,
                            status
                        )
                    `)
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });
                const { data, error } = await query as unknown as { data: unknown[] | null; error: Error | null };

                if (error) {
                    console.error('Error fetching chat sessions:', error);
                    setError(`Failed to load chat history: ${error.message}`);
                    return;
                }

                if (data) {
                    const rows = (data ?? []) as unknown[];
                    const formattedData: TableRowData[] = rows.map((r) => {
                        const s = mapSessionRow(r as unknown as import('../utils/dbMappers').DBSessionRow);
                        const userMessage = s.messages.find((m) => m.role === 'user');
                        const aiMessage = s.messages.find((m) => m.role === 'assistant');
                        const createdAt = s.created_at;
                        const sessionDate = createdAt ? new Date(createdAt).toLocaleDateString() : '';
                        const sessionTime = createdAt ? new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                        // Since promptTemplateId is not in the database schema, we'll show 'No Template' for now
                        const templateName = 'No Template';

                        return {
                            id: s.id || '',
                            title: s.title || '',
                            date: sessionDate,
                            time: sessionTime,
                            model: (userMessage as unknown as { model?: string | undefined })?.model || 'Unknown',
                            template: templateName,
                            userMessageContent: userMessage?.content || '',
                            aiMessageContent: aiMessage?.content,
                        };
                    });
                    setTableData(formattedData);

                } else {
                    setTableData([]);
                }
            } catch (err: unknown) {
                console.error('Unexpected error fetching chat sessions:', err);
                const message = err instanceof Error ? err.message : String(err);
                setError(`Unexpected error loading chat history: ${message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchChatSessions();
    }, [userId]);

     const showPrompt = (content: string) => {
        setDialogTitle("User Prompt");
        setDialogContent(content);
        setDialogOpen(true);
    };

    const showResponse = (content?: string) => {
      if (content){
        setDialogTitle("AI Response");
        setDialogContent(content);
        setDialogOpen(true);
      }
    };


    if (loading) {
        return <div>Loading chat history...</div>;
    }

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }
    if (!user) {
      return <div>Please Log in to View History</div>
    }

    return (
        <div className={`min-h-screen pt-16 ${isDarkTheme ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold mb-4">AI History</h1>
                </div>
                <Table>
                    <TableCaption>A list of your recent chat sessions.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead className="w-[400px]">Session Title</TableHead>
                            <TableHead>Model</TableHead>
                            <TableHead>Template</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tableData.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>{row.date}</TableCell>
                                <TableCell>{row.time}</TableCell>
                                <TableCell className="font-medium">{row.title}</TableCell>
                                <TableCell>{row.model}</TableCell>
                                <TableCell>{row.template}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => showPrompt(row.userMessageContent)}>
                                                <FileText className="mr-2 h-4 w-4" />
                                                <span>View User Prompt</span>
                                            </DropdownMenuItem>
                                             <DropdownMenuItem onClick={() => showResponse(row.aiMessageContent)}>
                                              <FileText className="mr-2 h-4 w-4" />
                                                <span>View AI Response</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{dialogTitle}</DialogTitle>
                            <DialogDescription>
                            <div className="whitespace-pre-wrap max-h-96 overflow-y-auto">
                                {dialogContent}
                            </div>
                            </DialogDescription>
                        </DialogHeader>
                        {/* DialogFooter with Save and Close buttons */}
                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>
                                Close
                            </Button>
                            <Button type="button" onClick={() => { /* Save logic here later */ }}>
                                Save
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default AIHistoryPage;