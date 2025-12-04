import api from './api';
import { Member, Task, Result, CardType, ChosenTaskType } from './types';

export const authAPI = {
  login: async (uuid: string) => {
    const response = await api.post('/auth/login', { UUID: uuid });
    return response.data;
  },
  logout: async () => {
    await api.post('/auth/logout');
  },
};

export const membersAPI = {
  getMemberInfo: async (): Promise<Member> => {
    const response = await api.get('/members/me');
    return response.data;
  },
  getAllMembers: async (): Promise<Member[]> => {
    const response = await api.get('/members/all');
    return response.data;
  },
  updateMemberStatus: async (memberId: string, status: string) => {
    const response = await api.post('/members/update-status', { memberId, status });
    return response.data;
  },
};

export const tasksAPI = {
  getOpenTasks: async (): Promise<Task[]> => {
    const response = await api.get('/tasks');
    return response.data;
  },
  getAllTasks: async (): Promise<Task[]> => {
    const response = await api.get('/tasks/all');
    return response.data;
  },
  getTaskDetails: async (id: string): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },
  randomTask: async (cardType: CardType): Promise<Task> => {
    const response = await api.post('/tasks/random', { CardType: cardType });
    return response.data;
  },
};

export const resultsAPI = {
  getResultDetails: async (id: string): Promise<Result> => {
    const response = await api.get(`/results/${id}`);
    return response.data;
  },
  randomResult: async (chosenTaskType: ChosenTaskType): Promise<Result> => {
    const response = await api.post('/results/random', { ChosenTaskType: chosenTaskType });
    return response.data;
  },
};

export const adminAPI = {
  markTaskCompleted: async (memberId: string) => {
    const response = await api.post('/admin/mark-task-completed', { memberId });
    return response.data;
  },
};

