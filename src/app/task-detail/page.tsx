'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { membersAPI, tasksAPI, resultsAPI } from '@/lib/api-client';
import { Member, Task, ChosenTaskType } from '@/lib/types';
import styles from './page.module.css';

export default function TaskDetail() {
  const [member, setMember] = useState<Member | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
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
      const memberInfo = await membersAPI.getMemberInfo();
      setMember(memberInfo);

      // If member already has ResultId, redirect to result page
      if (memberInfo.ResultId) {
        router.push('/result');
        return;
      }

      // Check status - redirect if not appropriate
      if (memberInfo.Status === 'PENDING' || memberInfo.Status === 'CHOSEN') {
        router.push('/program-selection');
        return;
      }

      if (memberInfo.Status !== 'TODO' && memberInfo.Status !== 'DONE') {
        router.push('/result');
        return;
      }

      // Load task if TaskId exists
      if (memberInfo.TaskId) {
        const taskData = await tasksAPI.getTaskDetails(memberInfo.TaskId);
        setTask(taskData);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async () => {
    // Prevent spinning if already has result
    if (member?.ResultId) {
      setError('Bạn đã quay thưởng rồi. Không thể quay lại.');
      router.push('/result');
      return;
    }

    if (!member || member.Status !== 'DONE') {
      setError('Bạn chưa hoàn thành task. Vui lòng đợi admin xác nhận.');
      return;
    }

    try {
      setSubmitting(true);
      const result = await resultsAPI.randomResult(ChosenTaskType.TAKE_CHALLENGE);
      
      // Update member info
      const updatedMember = await membersAPI.getMemberInfo();
      setMember(updatedMember);
      
      // Update cookies
      Cookies.set('member', JSON.stringify(updatedMember), { expires: 1 });
      
      router.push('/result');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi nhận thưởng');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Đang tải...</div>
      </div>
    );
  }

  if (!task && member?.TaskId) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Không tìm thấy task</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Chi Tiết Task</h1>

        {error && <div className={styles.error}>{error}</div>}

        {task && (
          <div className={styles.taskCard}>
            <div className={styles.taskHeader}>
              <span className={`${styles.taskType} ${styles[task.TaskType.toLowerCase()]}`}>
                {task.TaskType}
              </span>
            </div>
            <div className={styles.taskDescription}>
              <h3>Mô tả:</h3>
              <p>{task.descriptions}</p>
            </div>
          </div>
        )}

        {member && (
          <div className={styles.memberInfo}>
            <p className={styles.status}>
              Trạng thái: <strong>{member.Status}</strong>
            </p>
            {member.CardType && (
              <p className={styles.cardType}>
                Loại thẻ: <strong>{member.CardType}</strong>
              </p>
            )}
          </div>
        )}

        <button
          onClick={handleCompleteTask}
          disabled={submitting || !member || member.Status !== 'DONE'}
          className={styles.completeButton}
        >
          {submitting ? 'Đang xử lý...' : 'Hoàn thành task'}
        </button>

        {member && member.Status !== 'DONE' && (
          <p className={styles.waitMessage}>
            ⏳ Vui lòng đợi admin xác nhận hoàn thành task
          </p>
        )}
      </div>
    </div>
  );
}

