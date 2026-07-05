import { storage } from './storage';

const BASE = 'https://unisum.duckdns.org/api';

export type User = { id: number; email: string; university: string; department: string };
export type Term = { id: number; user_id: number; class_level: string; term_number: number; gpa?: number; totalCredits?: number };
export type Course = { id: number; term_id: number; user_id: number; name: string; credits: number; average: number; gpa?: number; letterGrade?: string };
export type Grade = { id: number; course_id: number; grade_type: string; score: number; weight: number };

let token: string | null = null;

export async function loadToken() {
  token = await storage.get('token');
  return token;
}
export function getToken() {
  return token;
}

async function req(path: string, opts: RequestInit = {}) {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch { json = text; }
  if (!res.ok) throw new Error((json && json.message) || `HTTP ${res.status}`);
  return json;
}

export const api = {
  async login(email: string, password: string): Promise<User> {
    const r = await req('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    token = r.token;
    await storage.set('token', r.token);
    await storage.set('user', JSON.stringify(r.user));
    return r.user as User;
  },
  async signup(email: string, password: string, university: string, department: string) {
    return req('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, university, department }) });
  },
  async logout() {
    token = null;
    await storage.del('token');
    await storage.del('user');
  },
  async me(): Promise<User | null> {
    const u = await storage.get('user');
    return u ? (JSON.parse(u) as User) : null;
  },
  terms: () => req('/terms/my-terms') as Promise<Term[]>,
  courses: (termId: number) => req(`/courses/term/${termId}`).then((r: any) => r.courses as Course[]),
  grades: (courseId: number) => req(`/grades/courses/${courseId}/grades`) as Promise<Grade[]>,
  updateCourseGPA: (courseId: number) => req(`/courses/${courseId}/updateGPA`, { method: 'PUT', body: '{}' }),
};

export function classLevelLabel(level: string) {
  const map: Record<string, string> = { pre: 'Hazırlık', '1': '1. Sınıf', '2': '2. Sınıf', '3': '3. Sınıf', '4': '4. Sınıf' };
  return map[level] || level;
}
export const GRADE_TYPE_LABELS: Record<string, string> = {
  grade_type_midterm: 'Vize', grade_type_final: 'Final', grade_type_quiz1: 'Quiz 1', grade_type_quiz2: 'Quiz 2',
  grade_type_project: 'Proje', grade_type_homework: 'Ödev', grade_type_presentation: 'Sunum', grade_type_custom: 'Özel',
};
export const gradeTypeLabel = (t: string) => GRADE_TYPE_LABELS[t] || t;
