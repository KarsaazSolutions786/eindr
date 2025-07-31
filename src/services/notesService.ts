import { noteApi } from './api';
import { AxiosResponse } from 'axios';

// Types based on the backend schemas
export interface Note {
  id: number;
  customer_id: number;
  title?: string;
  description?: string;
  content_type: string;
  is_shared: boolean;
  is_favorite: boolean;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  last_accessed?: string;
  customer: {
    id: number;
    email: string;
  };
}

export interface NoteShare {
  id: number;
  note_id: number;
  shared_by_id: number;
  shared_with_id: number;
  permission_level: string;
  can_edit: boolean;
  can_delete: boolean;
  can_reshare: boolean;
  shared_at: string;
  expires_at?: string;
  is_active: boolean;
  shared_by: {
    id: number;
    email: string;
  };
  shared_with: {
    id: number;
    email: string;
  };
}

export interface NoteWithShares extends Note {
  shares: NoteShare[];
}

export interface NotesListResponse {
  notes: Note[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface NoteCreate {
  title?: string;
  description?: string;
  content_type?: 'text' | 'markdown' | 'html';
  is_favorite?: boolean;
  is_pinned?: boolean;
}

export interface NoteUpdate {
  title?: string;
  description?: string;
  content_type?: 'text' | 'markdown' | 'html';
  is_favorite?: boolean;
  is_pinned?: boolean;
}

export interface NoteFilters {
  is_favorite?: boolean;
  is_pinned?: boolean;
  is_shared?: boolean;
  content_type?: 'text' | 'markdown' | 'html';
  search?: string;
  shared_with_me?: boolean;
}

export interface NoteStats {
  total_notes: number;
  favorite_notes: number;
  pinned_notes: number;
  shared_notes: number;
  notes_shared_with_me: number;
  notes_by_content_type: Record<string, number>;
}

export interface NoteBulkUpdate {
  note_ids: number[];
  is_favorite?: boolean;
  is_pinned?: boolean;
}

export interface NoteBulkDelete {
  note_ids: number[];
}

export interface NoteShareCreate {
  shared_with_id: number;
  permission_level?: 'read' | 'write' | 'admin';
  can_edit?: boolean;
  can_delete?: boolean;
  can_reshare?: boolean;
  expires_at?: string;
}

export interface NoteShareUpdate {
  permission_level?: 'read' | 'write' | 'admin';
  can_edit?: boolean;
  can_delete?: boolean;
  can_reshare?: boolean;
  expires_at?: string;
  is_active?: boolean;
}

class NotesService {
  // Get all notes with optional filters and pagination
  async getNotes(
    page: number = 1,
    limit: number = 20,
    filters?: NoteFilters
  ): Promise<NotesListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const response: AxiosResponse<NotesListResponse> = await noteApi.get(
        `/notes?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  }

  // Get note statistics
  async getNoteStats(): Promise<NoteStats> {
    try {
      const response: AxiosResponse<NoteStats> = await noteApi.get('/notes/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching note stats:', error);
      throw error;
    }
  }

  // Get a specific note by ID
  async getNoteById(noteId: number): Promise<Note> {
    try {
      const response: AxiosResponse<Note> = await noteApi.get(`/notes/${noteId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching note:', error);
      throw error;
    }
  }

  // Create a new note
  async createNote(noteData: NoteCreate): Promise<Note> {
    try {
      const response: AxiosResponse<Note> = await noteApi.post('/notes/', noteData);
      return response.data;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }

  // Update an existing note
  async updateNote(noteId: number, noteData: NoteUpdate): Promise<Note> {
    try {
      const response: AxiosResponse<Note> = await noteApi.put(
        `/notes/${noteId}`,
        noteData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }

  // Delete a note
  async deleteNote(noteId: number): Promise<void> {
    try {
      await noteApi.delete(`/notes/${noteId}`);
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }

  // Share a note with another user
  async shareNote(noteId: number, shareData: NoteShareCreate): Promise<NoteShare> {
    try {
      const response: AxiosResponse<NoteShare> = await noteApi.post(
        `/notes/${noteId}/share`,
        shareData
      );
      return response.data;
    } catch (error) {
      console.error('Error sharing note:', error);
      throw error;
    }
  }

  // Get note shares
  async getNoteShares(noteId: number): Promise<NoteShare[]> {
    try {
      const response: AxiosResponse<NoteShare[]> = await noteApi.get(
        `/notes/${noteId}/shares`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching note shares:', error);
      throw error;
    }
  }

  // Update note share permissions
  async updateNoteShare(
    shareId: number,
    shareData: NoteShareUpdate
  ): Promise<NoteShare> {
    try {
      const response: AxiosResponse<NoteShare> = await noteApi.put(
        `/notes/shares/${shareId}`,
        shareData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating note share:', error);
      throw error;
    }
  }

  // Revoke note share
  async revokeNoteShare(shareId: number): Promise<void> {
    try {
      await noteApi.delete(`/notes/shares/${shareId}`);
    } catch (error) {
      console.error('Error revoking note share:', error);
      throw error;
    }
  }

  // Bulk update notes
  async bulkUpdateNotes(updateData: NoteBulkUpdate): Promise<{ updated_count: number }> {
    try {
      const response: AxiosResponse<{ updated_count: number }> = await noteApi.post(
        '/notes/bulk-update',
        updateData
      );
      return response.data;
    } catch (error) {
      console.error('Error bulk updating notes:', error);
      throw error;
    }
  }

  // Bulk delete notes
  async bulkDeleteNotes(deleteData: NoteBulkDelete): Promise<{ deleted_count: number }> {
    try {
      const response: AxiosResponse<{ deleted_count: number }> = await noteApi.delete(
        '/notes/bulk-delete',
        { data: deleteData }
      );
      return response.data;
    } catch (error) {
      console.error('Error bulk deleting notes:', error);
      throw error;
    }
  }

  // Toggle favorite status
  async toggleFavorite(noteId: number, isFavorite: boolean): Promise<Note> {
    return this.updateNote(noteId, { is_favorite: isFavorite });
  }

  // Toggle pinned status
  async togglePinned(noteId: number, isPinned: boolean): Promise<Note> {
    return this.updateNote(noteId, { is_pinned: isPinned });
  }
}

export const notesService = new NotesService();
export default notesService;