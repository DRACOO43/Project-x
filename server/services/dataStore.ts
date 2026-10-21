import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User, IUser, UserRole } from '../models/User.ts';
import { Project, IProject, ProjectPriority, ProjectStatus } from '../models/Project.ts';
import { Task, ITask, TaskPriority, TaskStatus } from '../models/Task.ts';
import { Notification, INotification, NotificationType } from '../models/Notification.ts';

// In-memory fallback collections for live demonstration when local MongoDB is not running
interface MemUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface MemProject {
  _id: string;
  title: string;
  description: string;
  owner: string;
  members: string[];
  startDate: Date;
  dueDate: Date;
  priority: ProjectPriority;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface MemComment {
  _id: string;
  user: string;
  text: string;
  createdAt: Date;
}

interface MemTask {
  _id: string;
  title: string;
  description: string;
  project: string;
  assignedTo?: string;
  createdBy: string;
  priority: TaskPriority;
  status: TaskStatus;
  startDate?: Date;
  dueDate: Date;
  estimatedEffort?: number;
  labels: string[];
  comments: MemComment[];
  createdAt: Date;
  updatedAt: Date;
}

interface MemNotification {
  _id: string;
  recipient: string;
  type: NotificationType;
  message: string;
  relatedProject?: string;
  relatedTask?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class ResilientDataStore {
  private memUsers: MemUser[] = [];
  private memProjects: MemProject[] = [];
  private memTasks: MemTask[] = [];
  private memNotifications: MemNotification[] = [];
  private initialized = false;

  private isMongoReady(): boolean {
    return mongoose.connection.readyState === 1;
  }

  public async initSeed() {
    if (this.initialized) return;
    this.initialized = true;

    // Check if Mongo is connected and empty or populate in-memory
    const passwordHash = await bcrypt.hash('password123', 10);
    const adminHash = await bcrypt.hash('admin123', 10);
    const pmHash = await bcrypt.hash('pm123', 10);
    const memberHash = await bcrypt.hash('member123', 10);

    const now = new Date();
    const dMinus5 = new Date(now.getTime() - 5 * 86400000);
    const dMinus2 = new Date(now.getTime() - 2 * 86400000);
    const dPlus2 = new Date(now.getTime() + 2 * 86400000);
    const dPlus7 = new Date(now.getTime() + 7 * 86400000);
    const dPlus14 = new Date(now.getTime() + 14 * 86400000);

    const uAdmin: MemUser = {
      _id: '64a000000000000000000001',
      name: 'Sarah Connor (Admin)',
      email: 'admin@smartpm.local',
      passwordHash: adminHash,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      isActive: true,
      createdAt: dMinus5,
      updatedAt: dMinus5,
    };

    const uPM: MemUser = {
      _id: '64a000000000000000000002',
      name: 'Alex Rivera (Project Manager)',
      email: 'pm@smartpm.local',
      passwordHash: pmHash,
      role: 'project_manager',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      isActive: true,
      createdAt: dMinus5,
      updatedAt: dMinus5,
    };

    const uMember1: MemUser = {
      _id: '64a000000000000000000003',
      name: 'David Chen (Frontend Dev)',
      email: 'member@smartpm.local',
      passwordHash: memberHash,
      role: 'team_member',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      isActive: true,
      createdAt: dMinus5,
      updatedAt: dMinus5,
    };

    const uMember2: MemUser = {
      _id: '64a000000000000000000004',
      name: 'Emma Watson (Backend Dev)',
      email: 'emma@smartpm.local',
      passwordHash: passwordHash,
      role: 'team_member',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      isActive: true,
      createdAt: dMinus5,
      updatedAt: dMinus5,
    };

    this.memUsers = [uAdmin, uPM, uMember1, uMember2];

    const p1: MemProject = {
      _id: '64b000000000000000000001',
      title: 'Cloud Analytics Platform Upgrade',
      description: 'Modernizing internal reporting engines and real-time dashboard analytics pipeline.',
      owner: uPM._id,
      members: [uPM._id, uMember1._id, uMember2._id],
      startDate: dMinus5,
      dueDate: dPlus7,
      priority: 'high',
      status: 'in_progress',
      createdAt: dMinus5,
      updatedAt: dMinus2,
    };

    const p2: MemProject = {
      _id: '64b000000000000000000002',
      title: 'Mobile App Authentication Redesign',
      description: 'Implementing biometric login, OAuth2 federation and zero-trust session management.',
      owner: uPM._id,
      members: [uPM._id, uMember1._id],
      startDate: dMinus2,
      dueDate: dPlus2, // Due soon!
      priority: 'critical',
      status: 'in_progress',
      createdAt: dMinus2,
      updatedAt: now,
    };

    const p3: MemProject = {
      _id: '64b000000000000000000003',
      title: 'Enterprise Payment Gateway Integration',
      description: 'Integrating multi-currency payment checkout and automated webhook reconciliation.',
      owner: uPM._id,
      members: [uPM._id, uMember2._id],
      startDate: dMinus5,
      dueDate: dPlus14,
      priority: 'medium',
      status: 'planning',
      createdAt: dMinus5,
      updatedAt: dMinus5,
    };

    this.memProjects = [p1, p2, p3];

    const t1: MemTask = {
      _id: '64c000000000000000000001',
      title: 'Design API contracts and OpenTelemetry specs',
      description: 'Draft OpenAPI 3.1 endpoints and define distributed tracing spans.',
      project: p1._id,
      assignedTo: uMember2._id,
      createdBy: uPM._id,
      priority: 'high',
      status: 'completed',
      startDate: dMinus5,
      dueDate: dMinus2,
      estimatedEffort: 8,
      labels: ['Backend', 'Architecture'],
      comments: [
        {
          _id: '64d000000000000000000001',
          user: uPM._id,
          text: 'Specs reviewed and approved by engineering committee.',
          createdAt: dMinus2,
        },
      ],
      createdAt: dMinus5,
      updatedAt: dMinus2,
    };

    const t2: MemTask = {
      _id: '64c000000000000000000002',
      title: 'Build interactive Recharts telemetry widgets',
      description: 'Construct responsive KPI cards, status donut charts, and throughput heatmaps.',
      project: p1._id,
      assignedTo: uMember1._id,
      createdBy: uPM._id,
      priority: 'medium',
      status: 'in_progress',
      startDate: dMinus2,
      dueDate: dPlus7,
      estimatedEffort: 12,
      labels: ['Frontend', 'UI'],
      comments: [],
      createdAt: dMinus2,
      updatedAt: now,
    };

    const t3: MemTask = {
      _id: '64c000000000000000000003',
      title: 'Audit legacy password validation endpoints',
      description: 'Resolve security vulnerabilities and implement bcrypt work factor of 10.',
      project: p2._id,
      assignedTo: uMember1._id,
      createdBy: uPM._id,
      priority: 'critical',
      status: 'in_progress',
      startDate: dMinus2,
      dueDate: dPlus2, // Due in 2 days (Due soon)
      estimatedEffort: 6,
      labels: ['Security', 'Auth'],
      comments: [
        {
          _id: '64d000000000000000000002',
          user: uMember1._id,
          text: 'Found 2 outdated endpoints, patching now.',
          createdAt: now,
        },
      ],
      createdAt: dMinus2,
      updatedAt: now,
    };

    const t4: MemTask = {
      _id: '64c000000000000000000004',
      title: 'Fix token refresh race conditions',
      description: 'Prevent concurrent client requests from causing false 401 unauthorized errors.',
      project: p2._id,
      assignedTo: uMember2._id,
      createdBy: uPM._id,
      priority: 'high',
      status: 'to_do',
      startDate: dMinus5,
      dueDate: dMinus2, // OVERDUE!
      estimatedEffort: 4,
      labels: ['Bug', 'Auth'],
      comments: [],
      createdAt: dMinus5,
      updatedAt: dMinus2,
    };

    this.memTasks = [t1, t2, t3, t4];

    this.memNotifications = [
      {
        _id: '64e000000000000000000001',
        recipient: uMember1._id,
        type: 'task_assigned',
        message: 'Alex Rivera assigned you to task "Build interactive Recharts telemetry widgets"',
        relatedProject: p1._id,
        relatedTask: t2._id,
        isRead: false,
        createdAt: dMinus2,
        updatedAt: dMinus2,
      },
      {
        _id: '64e000000000000000000002',
        recipient: uMember1._id,
        type: 'deadline_approaching',
        message: 'Task "Audit legacy password validation endpoints" is due in 2 days.',
        relatedProject: p2._id,
        relatedTask: t3._id,
        isRead: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        _id: '64e000000000000000000003',
        recipient: uAdmin._id,
        type: 'system',
        message: 'Welcome to Smart Platform for Project Management. System is online.',
        isRead: true,
        createdAt: dMinus5,
        updatedAt: dMinus5,
      },
    ];

    // If real Mongo is connected, sync seed data if collections are empty
    if (this.isMongoReady()) {
      try {
        const count = await User.countDocuments();
        if (count === 0) {
          console.log('[MongoDB] Seeding database with initial users, projects, and tasks...');
          await User.insertMany(this.memUsers);
          await Project.insertMany(this.memProjects);
          await Task.insertMany(this.memTasks);
          await Notification.insertMany(this.memNotifications);
          console.log('[MongoDB] Seed completed successfully.');
        }
      } catch (e) {
        console.warn('[MongoDB] Sync seed encountered warning:', e);
      }
    }
  }

  // USER CRUD
  public async findUsers(query: { search?: string; role?: string } = {}) {
    if (this.isMongoReady()) {
      const filter: any = {};
      if (query.role) filter.role = query.role;
      if (query.search) {
        filter.$or = [
          { name: { $regex: query.search, $options: 'i' } },
          { email: { $regex: query.search, $options: 'i' } },
        ];
      }
      return await User.find(filter).select('-passwordHash').sort({ createdAt: -1 });
    }

    let list = [...this.memUsers];
    if (query.role) {
      list = list.filter((u) => u.role === query.role);
    }
    if (query.search) {
      const s = query.search.toLowerCase();
      list = list.filter((u) => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
    }
    return list.map(({ passwordHash, ...rest }) => rest);
  }

  public async findUserById(id: string, includePassword = false) {
    if (this.isMongoReady()) {
      const q = User.findById(id);
      if (includePassword) q.select('+passwordHash');
      return await q;
    }
    const found = this.memUsers.find((u) => u._id.toString() === id.toString());
    if (!found) return null;
    if (includePassword) return found;
    const { passwordHash, ...rest } = found;
    return rest;
  }

  public async findUserByEmail(email: string, includePassword = true) {
    const norm = email.toLowerCase().trim();
    if (this.isMongoReady()) {
      const q = User.findOne({ email: norm });
      if (includePassword) q.select('+passwordHash');
      return await q;
    }
    const found = this.memUsers.find((u) => u.email.toLowerCase() === norm);
    if (!found) return null;
    if (includePassword) return found;
    const { passwordHash, ...rest } = found;
    return rest;
  }

  public async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    avatar?: string;
  }) {
    const passwordHash = await bcrypt.hash(userData.password, 10);
    const email = userData.email.toLowerCase().trim();

    if (this.isMongoReady()) {
      const created = await User.create({
        name: userData.name,
        email,
        passwordHash,
        role: userData.role || 'team_member',
        avatar: userData.avatar || '',
        isActive: true,
      });
      const obj = created.toObject();
      delete obj.passwordHash;
      return obj;
    }

    const newUser: MemUser = {
      _id: new mongoose.Types.ObjectId().toString(),
      name: userData.name,
      email,
      passwordHash,
      role: userData.role || 'team_member',
      avatar: userData.avatar || '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.memUsers.push(newUser);
    const { passwordHash: _, ...rest } = newUser;
    return rest;
  }

  public async updateUser(id: string, updateData: Partial<MemUser>) {
    if (this.isMongoReady()) {
      return await User.findByIdAndUpdate(id, updateData, { new: true }).select('-passwordHash');
    }
    const idx = this.memUsers.findIndex((u) => u._id.toString() === id.toString());
    if (idx === -1) return null;
    this.memUsers[idx] = {
      ...this.memUsers[idx],
      ...updateData,
      updatedAt: new Date(),
    };
    const { passwordHash, ...rest } = this.memUsers[idx];
    return rest;
  }

  // PROJECT CRUD
  public async getProjects(user: { id: string; role: UserRole }, filters: any = {}) {
    let rawProjects: any[] = [];

    if (this.isMongoReady()) {
      let filter: any = {};
      if (user.role === 'team_member') {
        filter = { members: user.id };
      } else if (user.role === 'project_manager') {
        filter = { $or: [{ owner: user.id }, { members: user.id }] };
      }
      rawProjects = await Project.find(filter)
        .populate('owner', 'name email avatar role')
        .populate('members', 'name email avatar role')
        .sort({ createdAt: -1 });
    } else {
      let list = [...this.memProjects];
      if (user.role === 'team_member') {
        list = list.filter((p) => p.members.map(String).includes(user.id.toString()));
      } else if (user.role === 'project_manager') {
        list = list.filter(
          (p) =>
            p.owner.toString() === user.id.toString() ||
            p.members.map(String).includes(user.id.toString())
        );
      }
      rawProjects = list.map((p) => ({
        ...p,
        owner: this.memUsers.find((u) => u._id.toString() === p.owner.toString()),
        members: p.members.map((mId) => this.memUsers.find((u) => u._id.toString() === mId.toString())),
      }));
    }

    // Attach dynamic progress & health calculation for each project
    const allTasks = await this.getAllTasksList();
    const enriched = rawProjects.map((proj) => {
      const pId = (proj._id || proj.id).toString();
      const projTasks = allTasks.filter((t) => (t.project?._id || t.project || '').toString() === pId);
      const totalTasks = projTasks.length;
      const completedTasks = projTasks.filter((t) => t.status === 'completed').length;
      const overdueTasks = projTasks.filter(
        (t) => t.status !== 'completed' && new Date(t.dueDate) < new Date()
      ).length;

      // Formula: Project Progress (%) = (Completed Tasks / Total Tasks) * 100. 0% if total is 0.
      const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

      // Smart Health Calculation
      const now = new Date();
      const dueDate = new Date(proj.dueDate);
      const daysRemaining = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

      let health: 'on_track' | 'at_risk' | 'delayed' | 'completed' = 'on_track';
      if (proj.status === 'completed' || progress === 100) {
        health = 'completed';
      } else if (dueDate < now && progress < 100) {
        health = 'delayed';
      } else if (overdueTasks > 0 || (daysRemaining <= 3 && progress < 60)) {
        health = 'at_risk';
      }

      return {
        ...(proj.toObject ? proj.toObject() : proj),
        progress,
        totalTasks,
        completedTasks,
        overdueTasks,
        health,
      };
    });

    // Apply query filters
    let result = enriched;
    if (filters.status && filters.status !== 'all') {
      result = result.filter((p) => p.status === filters.status);
    }
    if (filters.priority && filters.priority !== 'all') {
      result = result.filter((p) => p.priority === filters.priority);
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(s) ||
          p.description?.toLowerCase().includes(s)
      );
    }

    return result;
  }

  public async getProjectById(id: string) {
    let proj: any = null;
    if (this.isMongoReady()) {
      proj = await Project.findById(id)
        .populate('owner', 'name email avatar role')
        .populate('members', 'name email avatar role');
      if (!proj) return null;
      proj = proj.toObject();
    } else {
      const found = this.memProjects.find((p) => p._id.toString() === id.toString());
      if (!found) return null;
      proj = {
        ...found,
        owner: this.memUsers.find((u) => u._id.toString() === found.owner.toString()),
        members: found.members.map((mId) =>
          this.memUsers.find((u) => u._id.toString() === mId.toString())
        ),
      };
    }

    // Attach tasks and progress
    const allTasks = await this.getAllTasksList();
    const projTasks = allTasks.filter((t) => (t.project?._id || t.project || '').toString() === id.toString());
    const totalTasks = projTasks.length;
    const completedTasks = projTasks.filter((t) => t.status === 'completed').length;
    const overdueTasks = projTasks.filter(
      (t) => t.status !== 'completed' && new Date(t.dueDate) < new Date()
    ).length;

    const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const now = new Date();
    const dueDate = new Date(proj.dueDate);
    const daysRemaining = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    let health: 'on_track' | 'at_risk' | 'delayed' | 'completed' = 'on_track';
    if (proj.status === 'completed' || progress === 100) {
      health = 'completed';
    } else if (dueDate < now && progress < 100) {
      health = 'delayed';
    } else if (overdueTasks > 0 || (daysRemaining <= 3 && progress < 60)) {
      health = 'at_risk';
    }

    return {
      ...proj,
      progress,
      totalTasks,
      completedTasks,
      overdueTasks,
      health,
      tasks: projTasks,
    };
  }

  public async createProject(data: {
    title: string;
    description: string;
    owner: string;
    members?: string[];
    startDate: Date;
    dueDate: Date;
    priority: ProjectPriority;
    status: ProjectStatus;
  }) {
    const members = Array.from(new Set([data.owner, ...(data.members || [])]));

    if (this.isMongoReady()) {
      const created = await Project.create({
        ...data,
        members,
      });
      return await this.getProjectById(created._id.toString());
    }

    const newProj: MemProject = {
      _id: new mongoose.Types.ObjectId().toString(),
      title: data.title,
      description: data.description,
      owner: data.owner,
      members,
      startDate: new Date(data.startDate),
      dueDate: new Date(data.dueDate),
      priority: data.priority,
      status: data.status,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.memProjects.unshift(newProj);
    return await this.getProjectById(newProj._id);
  }

  public async updateProject(id: string, updateData: Partial<MemProject>) {
    if (this.isMongoReady()) {
      await Project.findByIdAndUpdate(id, updateData, { new: true });
      return await this.getProjectById(id);
    }
    const idx = this.memProjects.findIndex((p) => p._id.toString() === id.toString());
    if (idx === -1) return null;
    this.memProjects[idx] = {
      ...this.memProjects[idx],
      ...updateData,
      updatedAt: new Date(),
    };
    return await this.getProjectById(id);
  }

  public async deleteProject(id: string) {
    if (this.isMongoReady()) {
      await Project.findByIdAndDelete(id);
      await Task.deleteMany({ project: id });
      return true;
    }
    this.memProjects = this.memProjects.filter((p) => p._id.toString() !== id.toString());
    this.memTasks = this.memTasks.filter((t) => t.project.toString() !== id.toString());
    return true;
  }

  // TASK CRUD
  private async getAllTasksList(): Promise<any[]> {
    if (this.isMongoReady()) {
      return await Task.find()
        .populate('assignedTo', 'name email avatar role')
        .populate('createdBy', 'name email avatar role')
        .populate('project', 'title priority status')
        .sort({ dueDate: 1 });
    }
    return this.memTasks.map((t) => ({
      ...t,
      assignedTo: this.memUsers.find((u) => u._id.toString() === (t.assignedTo || '').toString()),
      createdBy: this.memUsers.find((u) => u._id.toString() === t.createdBy.toString()),
      project: this.memProjects.find((p) => p._id.toString() === t.project.toString()),
    }));
  }

  public async getTasks(user: { id: string; role: UserRole }, filters: any = {}) {
    const all = await this.getAllTasksList();
    let list = all;

    if (user.role === 'team_member') {
      // Team members see tasks assigned to them or in projects they belong to
      list = list.filter((t) => {
        const isAssigned = (t.assignedTo?._id || t.assignedTo || '').toString() === user.id.toString();
        const pId = (t.project?._id || t.project || '').toString();
        const memProj = this.memProjects.find((p) => p._id.toString() === pId);
        const inProj = memProj ? memProj.members.map(String).includes(user.id.toString()) : true;
        return isAssigned || inProj;
      });
    }

    if (filters.projectId) {
      list = list.filter((t) => (t.project?._id || t.project || '').toString() === filters.projectId.toString());
    }
    if (filters.status && filters.status !== 'all') {
      list = list.filter((t) => t.status === filters.status);
    }
    if (filters.priority && filters.priority !== 'all') {
      list = list.filter((t) => t.priority === filters.priority);
    }
    if (filters.assignedTo && filters.assignedTo !== 'all') {
      list = list.filter(
        (t) => (t.assignedTo?._id || t.assignedTo || '').toString() === filters.assignedTo.toString()
      );
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(s) ||
          t.description?.toLowerCase().includes(s) ||
          t.labels?.some((l: string) => l.toLowerCase().includes(s))
      );
    }

    return list;
  }

  public async getTaskById(id: string) {
    if (this.isMongoReady()) {
      return await Task.findById(id)
        .populate('assignedTo', 'name email avatar role')
        .populate('createdBy', 'name email avatar role')
        .populate('project', 'title priority status members')
        .populate('comments.user', 'name email avatar role');
    }
    const t = this.memTasks.find((task) => task._id.toString() === id.toString());
    if (!t) return null;
    return {
      ...t,
      assignedTo: this.memUsers.find((u) => u._id.toString() === (t.assignedTo || '').toString()),
      createdBy: this.memUsers.find((u) => u._id.toString() === t.createdBy.toString()),
      project: this.memProjects.find((p) => p._id.toString() === t.project.toString()),
      comments: t.comments.map((c) => ({
        ...c,
        user: this.memUsers.find((u) => u._id.toString() === c.user.toString()),
      })),
    };
  }

  public async createTask(data: {
    title: string;
    description: string;
    project: string;
    assignedTo?: string;
    createdBy: string;
    priority: TaskPriority;
    status: TaskStatus;
    startDate?: Date;
    dueDate: Date;
    estimatedEffort?: number;
    labels?: string[];
  }) {
    if (this.isMongoReady()) {
      const created = await Task.create({
        ...data,
        labels: data.labels || [],
        comments: [],
      });
      return await this.getTaskById(created._id.toString());
    }

    const newTask: MemTask = {
      _id: new mongoose.Types.ObjectId().toString(),
      title: data.title,
      description: data.description || '',
      project: data.project,
      assignedTo: data.assignedTo || undefined,
      createdBy: data.createdBy,
      priority: data.priority || 'medium',
      status: data.status || 'to_do',
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      dueDate: new Date(data.dueDate),
      estimatedEffort: data.estimatedEffort || 1,
      labels: data.labels || [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.memTasks.unshift(newTask);
    return await this.getTaskById(newTask._id);
  }

  public async updateTask(id: string, updateData: Partial<MemTask>) {
    if (this.isMongoReady()) {
      await Task.findByIdAndUpdate(id, updateData, { new: true });
      return await this.getTaskById(id);
    }
    const idx = this.memTasks.findIndex((t) => t._id.toString() === id.toString());
    if (idx === -1) return null;
    this.memTasks[idx] = {
      ...this.memTasks[idx],
      ...updateData,
      updatedAt: new Date(),
    };
    return await this.getTaskById(id);
  }

  public async deleteTask(id: string) {
    if (this.isMongoReady()) {
      await Task.findByIdAndDelete(id);
      return true;
    }
    this.memTasks = this.memTasks.filter((t) => t._id.toString() !== id.toString());
    return true;
  }

  public async addComment(taskId: string, userId: string, text: string) {
    if (this.isMongoReady()) {
      await Task.findByIdAndUpdate(
        taskId,
        {
          $push: {
            comments: {
              user: userId,
              text,
              createdAt: new Date(),
            },
          },
        },
        { new: true }
      );
      return await this.getTaskById(taskId);
    }

    const task = this.memTasks.find((t) => t._id.toString() === taskId.toString());
    if (!task) return null;
    task.comments.push({
      _id: new mongoose.Types.ObjectId().toString(),
      user: userId,
      text,
      createdAt: new Date(),
    });
    task.updatedAt = new Date();
    return await this.getTaskById(taskId);
  }

  // NOTIFICATIONS
  public async getNotifications(userId: string) {
    if (this.isMongoReady()) {
      return await Notification.find({ recipient: userId })
        .populate('relatedProject', 'title')
        .populate('relatedTask', 'title')
        .sort({ createdAt: -1 });
    }
    return this.memNotifications
      .filter((n) => n.recipient.toString() === userId.toString())
      .map((n) => ({
        ...n,
        relatedProject: this.memProjects.find((p) => p._id.toString() === (n.relatedProject || '').toString()),
        relatedTask: this.memTasks.find((t) => t._id.toString() === (n.relatedTask || '').toString()),
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async markNotificationRead(id: string, userId: string) {
    if (this.isMongoReady()) {
      return await Notification.findOneAndUpdate(
        { _id: id, recipient: userId },
        { isRead: true },
        { new: true }
      );
    }
    const n = this.memNotifications.find(
      (item) => item._id.toString() === id.toString() && item.recipient.toString() === userId.toString()
    );
    if (n) n.isRead = true;
    return n;
  }

  public async markAllNotificationsRead(userId: string) {
    if (this.isMongoReady()) {
      await Notification.updateMany({ recipient: userId }, { isRead: true });
      return true;
    }
    this.memNotifications.forEach((n) => {
      if (n.recipient.toString() === userId.toString()) n.isRead = true;
    });
    return true;
  }

  public async createNotification(
    recipientId: string,
    type: NotificationType,
    message: string,
    relatedProject?: string,
    relatedTask?: string
  ) {
    if (this.isMongoReady()) {
      return await Notification.create({
        recipient: recipientId,
        type,
        message,
        relatedProject,
        relatedTask,
        isRead: false,
      });
    }
    const n: MemNotification = {
      _id: new mongoose.Types.ObjectId().toString(),
      recipient: recipientId,
      type,
      message,
      relatedProject,
      relatedTask,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.memNotifications.unshift(n);
    return n;
  }

  // SMART FEATURES & ANALYTICS
  public async getDashboardSummary(user: { id: string; role: UserRole }) {
    const projects = await this.getProjects(user);
    const tasks = await this.getTasks(user);

    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status === 'in_progress').length;
    const completedProjects = projects.filter((p) => p.status === 'completed').length;

    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter((t) => t.status === 'to_do').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'in_progress' || t.status === 'in_review').length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 86400000);

    const overdueTasks = tasks.filter(
      (t) => t.status !== 'completed' && new Date(t.dueDate) < now
    );
    const upcomingDeadlines = tasks.filter(
      (t) =>
        t.status !== 'completed' &&
        new Date(t.dueDate) >= now &&
        new Date(t.dueDate) <= threeDaysFromNow
    );

    const myTasks = tasks.filter(
      (t) => (t.assignedTo?._id || t.assignedTo || '').toString() === user.id.toString()
    );

    const overallCompletionPercentage =
      totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    // Rule-Based Recommendations (as required by Section 10.C)
    // Heuristic order: 1. Overdue high/critical tasks 2. Tasks due soon (next 3 days) 3. High-priority tasks 4. Other tasks
    const ruleBasedRecommendations = [...tasks]
      .filter((t) => t.status !== 'completed')
      .sort((a, b) => {
        const aOverdue = new Date(a.dueDate) < now;
        const bOverdue = new Date(b.dueDate) < now;
        const aHigh = a.priority === 'critical' || a.priority === 'high';
        const bHigh = b.priority === 'critical' || b.priority === 'high';
        const aDueSoon = new Date(a.dueDate) <= threeDaysFromNow;
        const bDueSoon = new Date(b.dueDate) <= threeDaysFromNow;

        // Tier 1: Overdue high priority
        if (aOverdue && aHigh && !(bOverdue && bHigh)) return -1;
        if (bOverdue && bHigh && !(aOverdue && aHigh)) return 1;

        // Tier 2: Due soon
        if (aDueSoon && !bDueSoon) return -1;
        if (bDueSoon && !aDueSoon) return 1;

        // Tier 3: High priority
        if (aHigh && !bHigh) return -1;
        if (bHigh && !aHigh) return 1;

        // Tier 4: Earliest due date
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      })
      .slice(0, 5)
      .map((t) => {
        const isOverdue = new Date(t.dueDate) < now;
        const isDueSoon = new Date(t.dueDate) <= threeDaysFromNow;
        let reason = 'General backlog progression';
        if (isOverdue && (t.priority === 'critical' || t.priority === 'high')) {
          reason = 'Urgent: Overdue high-priority milestone';
        } else if (isDueSoon) {
          reason = 'Time-sensitive: Due within 3 days';
        } else if (t.priority === 'critical' || t.priority === 'high') {
          reason = 'High-impact project blocker';
        }
        return {
          task: t,
          reason,
        };
      });

    // Chart Data for Recharts
    const projectStatusDistribution = [
      { name: 'Planning', value: projects.filter((p) => p.status === 'planning').length, color: '#3b82f6' },
      { name: 'In Progress', value: projects.filter((p) => p.status === 'in_progress').length, color: '#0ea5e9' },
      { name: 'On Hold', value: projects.filter((p) => p.status === 'on_hold').length, color: '#f59e0b' },
      { name: 'Completed', value: projects.filter((p) => p.status === 'completed').length, color: '#10b981' },
      { name: 'Cancelled', value: projects.filter((p) => p.status === 'cancelled').length, color: '#ef4444' },
    ].filter((item) => item.value > 0);

    const taskStatusDistribution = [
      { name: 'To Do', count: pendingTasks, fill: '#94a3b8' },
      { name: 'In Progress', count: tasks.filter((t) => t.status === 'in_progress').length, fill: '#3b82f6' },
      { name: 'In Review', count: tasks.filter((t) => t.status === 'in_review').length, fill: '#8b5cf6' },
      { name: 'Completed', count: completedTasks, fill: '#10b981' },
      { name: 'Blocked', count: tasks.filter((t) => t.status === 'blocked').length, fill: '#ef4444' },
    ];

    const projectProgressList = projects.slice(0, 6).map((p) => ({
      name: p.title.length > 18 ? p.title.substring(0, 16) + '...' : p.title,
      progress: p.progress,
      status: p.status,
      health: p.health,
    }));

    return {
      stats: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        overdueTasksCount: overdueTasks.length,
        myTasksCount: myTasks.length,
        overallCompletionPercentage,
      },
      overdueTasks,
      upcomingDeadlines,
      ruleBasedRecommendations,
      charts: {
        projectStatusDistribution,
        taskStatusDistribution,
        projectProgressList,
      },
    };
  }
}

export const dataStore = new ResilientDataStore();
