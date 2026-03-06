import { Property, CleaningTask, Cleaner, AirolaNotification, User } from './types';

class AirolaDatabase {
  private STORAGE_KEYS = {
    USER: 'airola_db_session',
    USERS: 'airola_users',
    PROPERTIES: 'airola_properties',
    TASKS: 'airola_tasks',
    STAFF: 'airola_staff',
    NOTIFICATIONS: 'airola_notifications',
    DELETED_TASKS: 'airola_deleted_tasks'
  };

  private dispatchUpdate(source?: string) {
    const event = new CustomEvent('storage_update', { detail: { source } });
    window.dispatchEvent(event);
  }

  async getSession(): Promise<User | null> {
    const data = localStorage.getItem(this.STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  }

  async saveSession(user: User): Promise<void> {
    localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user));
    this.dispatchUpdate('session');
  }

  async clearSession(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEYS.USER);
    this.dispatchUpdate('session');
  }

  async getUsers(): Promise<User[]> {
    const data = localStorage.getItem(this.STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  }

  async saveUser(user: User): Promise<void> {
    const users = await this.getUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
    this.dispatchUpdate('users');
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const users = await this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  }

  async getProperties(ownerEmail?: string): Promise<Property[]> {
    const data = localStorage.getItem(this.STORAGE_KEYS.PROPERTIES);
    const props: Property[] = data ? JSON.parse(data) : [];
    if (ownerEmail) {
      return props.filter(p => (p as any).ownerEmail === ownerEmail);
    }
    return props;
  }

  async saveProperty(property: Property, source?: string): Promise<void> {
    const props = await this.getProperties();
    const idx = props.findIndex(p => p.id === property.id);
    if (idx >= 0) {
      props[idx] = property;
    } else {
      props.push(property);
    }
    localStorage.setItem(this.STORAGE_KEYS.PROPERTIES, JSON.stringify(props));
    this.dispatchUpdate(source || 'properties');
  }

  async getTasks(ownerEmail?: string): Promise<CleaningTask[]> {
    const data = localStorage.getItem(this.STORAGE_KEYS.TASKS);
    const tasks: CleaningTask[] = data ? JSON.parse(data) : [];
    if (ownerEmail) {
      return tasks.filter(t => (t as any).ownerEmail === ownerEmail);
    }
    return tasks;
  }

  async saveTask(task: CleaningTask, source?: string): Promise<void> {
    const tasks = await this.getTasks();
    const idx = tasks.findIndex(t => t.id === task.id);
    if (idx >= 0) {
      tasks[idx] = task;
    } else {
      tasks.push(task);
    }
    localStorage.setItem(this.STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    this.dispatchUpdate(source || 'tasks');
  }

  async deleteTask(taskId: string, source?: string): Promise<void> {
    const tasks = await this.getTasks();
    const filtered = tasks.filter(t => t.id !== taskId);
    localStorage.setItem(this.STORAGE_KEYS.TASKS, JSON.stringify(filtered));
    const deleted = await this.getDeletedTasks();
    if (!deleted.includes(taskId)) {
      deleted.push(taskId);
      localStorage.setItem(this.STORAGE_KEYS.DELETED_TASKS, JSON.stringify(deleted));
    }
    this.dispatchUpdate(source || 'tasks');
  }

  async getDeletedTasks(): Promise<string[]> {
    const data = localStorage.getItem(this.STORAGE_KEYS.DELETED_TASKS);
    return data ? JSON.parse(data) : [];
  }

  async getStaff(): Promise<Cleaner[]> {
    const data = localStorage.getItem(this.STORAGE_KEYS.STAFF);
    return data ? JSON.parse(data) : [];
  }

  async saveStaff(cleaner: Cleaner): Promise<void> {
    const staff = await this.getStaff();
    const idx = staff.findIndex(s => s.id === cleaner.id);
    if (idx >= 0) {
      staff[idx] = cleaner;
    } else {
      staff.push(cleaner);
    }
    localStorage.setItem(this.STORAGE_KEYS.STAFF, JSON.stringify(staff));
    this.dispatchUpdate('staff');
  }

  async deleteStaff(id: string): Promise<void> {
    const staff = await this.getStaff();
    const filtered = staff.filter(s => s.id !== id);
    localStorage.setItem(this.STORAGE_KEYS.STAFF, JSON.stringify(filtered));
    this.dispatchUpdate('staff');
  }

  async getNotifications(role?: string): Promise<AirolaNotification[]> {
    const data = localStorage.getItem(this.STORAGE_KEYS.NOTIFICATIONS);
    const notes: AirolaNotification[] = data ? JSON.parse(data) : [];
    if (role) {
      return notes.filter(n => (n as any).recipientRole === role);
    }
    return notes;
  }

  async addNotification(note: AirolaNotification): Promise<void> {
    const notes = await this.getNotifications();
    const idx = notes.findIndex(n => n.id === note.id);
    if (idx >= 0) {
      notes[idx] = note;
    } else {
      notes.push(note);
    }
    localStorage.setItem(this.STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notes));
    this.dispatchUpdate('notifications');
  }

  async markNotificationRead(id: string): Promise<void> {
    const notes = await this.getNotifications();
    const idx = notes.findIndex(n => n.id === id);
    if (idx >= 0) {
      (notes[idx] as any).read = true;
    }
    localStorage.setItem(this.STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notes));
    this.dispatchUpdate('notifications');
  }

  async deleteNotification(id: string): Promise<void> {
    const notes = await this.getNotifications();
    const filtered = notes.filter(n => n.id !== id);
    localStorage.setItem(this.STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(filtered));
    this.dispatchUpdate('notifications');
  }

  async submitGiveaway(data: { name: string; mobile: string; email: string; experience: string }): Promise<{ success: boolean; id?: string }> {
    const key = 'airola_giveaway_entries';
    const raw = localStorage.getItem(key);
    const entries = raw ? JSON.parse(raw) : [];
    const id = `GW-${Date.now()}`;
    const entry = { id, ...data, timestamp: new Date().toISOString() };
    entries.push(entry);
    localStorage.setItem(key, JSON.stringify(entries));
    return { success: true, id };
  }

  async getGiveawayEntries(): Promise<any[]> {
    const key = 'airola_giveaway_entries';
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  }

  async migrateFromLocalStorage(): Promise<void> {
    const keys = {
      PROPERTIES: 'hostclean_db_properties',
      TASKS: 'hostclean_db_tasks',
      STAFF: 'hostclean_db_staff',
      NOTIFICATIONS: 'hostclean_db_notifications',
      USERS_DB: 'hostclean_db_users'
    };
    const getLocal = (key: string) => {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    };
    const users = getLocal(keys.USERS_DB);
    if (users) {
      for (const u of users) await this.saveUser(u);
      localStorage.removeItem(keys.USERS_DB);
    }
    const properties = getLocal(keys.PROPERTIES);
    if (properties) {
      for (const p of properties) await this.saveProperty(p);
      localStorage.removeItem(keys.PROPERTIES);
    }
    const tasks = getLocal(keys.TASKS);
    if (tasks) {
      for (const t of tasks) await this.saveTask(t);
      localStorage.removeItem(keys.TASKS);
    }
    const staff = getLocal(keys.STAFF);
    if (staff) {
      for (const s of staff) await this.saveStaff(s);
      localStorage.removeItem(keys.STAFF);
    }
    const notifications = getLocal(keys.NOTIFICATIONS);
    if (notifications) {
      for (const n of notifications) await this.addNotification(n);
      localStorage.removeItem(keys.NOTIFICATIONS);
    }
  }
}

export const db = new AirolaDatabase();

db.migrateFromLocalStorage().catch(console.error);
