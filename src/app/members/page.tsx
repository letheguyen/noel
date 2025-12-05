'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { membersAPI, adminAPI, tasksAPI } from '@/lib/api-client';
import { Member, MemberStatus, Task } from '@/lib/types';
import { logout } from '@/lib/auth-utils';
import styles from './page.module.css';

interface MemberWithTask extends Member {
  taskDetails?: Task;
}

export default function MembersManagement() {
  const [member, setMember] = useState<Member | null>(null);
  const [members, setMembers] = useState<MemberWithTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/');
      return;
    }

    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [memberInfo, allMembers, allTasks] = await Promise.all([
        membersAPI.getMemberInfo(),
        membersAPI.getAllMembers(),
        tasksAPI.getAllTasks(),
      ]);

      setMember(memberInfo);

      // Check if user is admin
      if (!memberInfo.IsAdmin) {
        setError('Bạn không có quyền truy cập trang này');
        router.push('/program-selection');
        return;
      }

      // Create a map of task ID to task details
      const taskMap = new Map<string, Task>();
      allTasks.forEach(task => {
        taskMap.set(task.id, task);
      });

      // Map members with their task details
      const membersWithTasks = allMembers.map((m) => {
        const taskDetails = m.TaskId ? taskMap.get(m.TaskId) : undefined;
        return { ...m, taskDetails };
      });

      setMembers(membersWithTasks);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkTaskCompleted = async (memberId: string) => {
    try {
      setUpdating(memberId);
      setError('');
      setSuccess('');

      await adminAPI.markTaskCompleted(memberId);
      
      // Reload members list and tasks
      const [allMembers, allTasks] = await Promise.all([
        membersAPI.getAllMembers(),
        tasksAPI.getAllTasks(),
      ]);

      // Create a map of task ID to task details
      const taskMap = new Map<string, Task>();
      allTasks.forEach(task => {
        taskMap.set(task.id, task);
      });

      // Map members with their task details
      const membersWithTasks = allMembers.map((m) => {
        const taskDetails = m.TaskId ? taskMap.get(m.TaskId) : undefined;
        return { ...m, taskDetails };
      });

      setMembers(membersWithTasks);
      
      setSuccess(`Đã đánh dấu hoàn thành task thành công`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi đánh dấu hoàn thành task');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (member: MemberWithTask): string => {
    // If member has ResultId, show as rewarded regardless of status
    if (member.ResultId) {
      return styles.statusRewarded;
    }
    
    switch (member.Status) {
      case MemberStatus.PENDING:
        return styles.statusPending;
      case MemberStatus.CHOSEN:
        return styles.statusChosen;
      case MemberStatus.TODO:
        return styles.statusTodo;
      case MemberStatus.DONE:
        return styles.statusDone;
      default:
        return '';
    }
  };

  const getStatusLabel = (member: MemberWithTask): string => {
    // If member has ResultId, show as rewarded regardless of status
    if (member.ResultId) {
      return 'Đã nhận thưởng';
    }
    
    switch (member.Status) {
      case MemberStatus.PENDING:
        return 'Chờ chọn';
      case MemberStatus.CHOSEN:
        return 'Đã chọn';
      case MemberStatus.TODO:
        return 'Đang làm';
      case MemberStatus.DONE:
        return 'Hoàn thành';
      default:
        return member.Status;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Đang tải...</div>
      </div>
    );
  }

  if (!member?.IsAdmin) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Bạn không có quyền truy cập trang này</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>👥 Quản Lý Members</h1>
          <button
            onClick={logout}
            className={styles.backButton}
          >
            🚪 Đăng xuất
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{members.length}</div>
            <div className={styles.statLabel}>Tổng số members</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>
              {members.filter(m => m.Status === MemberStatus.DONE).length}
            </div>
            <div className={styles.statLabel}>Đã hoàn thành task</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>
              {members.filter(m => m.ResultId).length}
            </div>
            <div className={styles.statLabel}>Đã quay thưởng</div>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>UUID</th>
                <th>Tên</th>
                <th>Trạng thái</th>
                <th>Loại thẻ</th>
                <th>Thông tin Task</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td className={styles.uuidCell}>{m.UUID}</td>
                  <td>{m.Name}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusColor(m)}`}>
                      {getStatusLabel(m)}
                    </span>
                  </td>
                  <td>{m.CardType || '-'}</td>
                  <td className={styles.taskDetailsCell}>
                    {m.taskDetails ? (
                      <div className={styles.taskInfo}>
                        <div className={styles.taskDescription}>{m.taskDetails.descriptions}</div>
                        <div className={styles.taskType}>Loại: {m.taskDetails.TaskType}</div>
                      </div>
                    ) : (
                      <div className={styles.noTask}>-</div>
                    )}
                  </td>
                  <td>
                    {m.Status === MemberStatus.TODO && (
                      <button
                        onClick={() => handleMarkTaskCompleted(m.id)}
                        disabled={updating === m.id}
                        className={styles.completeButton}
                      >
                        {updating === m.id ? 'Đang cập nhật...' : 'Đánh dấu hoàn thành'}
                      </button>
                    )}
                    {m.Status !== MemberStatus.TODO && (
                      <span className={styles.noAction}>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

