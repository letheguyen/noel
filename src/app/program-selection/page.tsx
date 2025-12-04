'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { membersAPI, tasksAPI, resultsAPI } from '@/lib/api-client';
import { Member, ChosenTaskType, CardType } from '@/lib/types';
import styles from './page.module.css';

export default function ProgramSelection() {
  const [member, setMember] = useState<Member | null>(null);
  const [tasks, setTasks] = useState<Record<CardType, number>>({
    RED: 0,
    BLUE: 0,
    WHITE: 0,
  });
  const [loading, setLoading] = useState(true);
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
      const [memberInfo, tasksData] = await Promise.all([
        membersAPI.getMemberInfo(),
        tasksAPI.getOpenTasks(),
      ]);

      setMember(memberInfo);

      // If member already has ResultId, redirect to result page (cannot spin again)
      if (memberInfo.ResultId) {
        router.push('/result');
        return;
      }

      // Check status - if not CHOSEN, redirect
      if (memberInfo.Status !== 'CHOSEN' && memberInfo.Status !== 'PENDING') {
        redirectBasedOnStatus(memberInfo.Status);
        return;
      }

      // Count available tasks by type
      const taskCounts: Record<CardType, number> = {
        RED: tasksData.filter((t: any) => t.TaskType === 'RED').length,
        BLUE: tasksData.filter((t: any) => t.TaskType === 'BLUE').length,
        WHITE: tasksData.filter((t: any) => t.TaskType === 'WHITE').length,
      };

      setTasks(taskCounts);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const redirectBasedOnStatus = (status: string) => {
    switch (status) {
      case 'TODO':
        router.push('/task-detail');
        break;
      case 'DONE':
        router.push('/task-detail');
        break;
      default:
        router.push('/result');
    }
  };

  const handleClaimReward = async () => {
    // Prevent spinning if already has result
    if (member?.ResultId) {
      setError('Bạn đã quay thưởng rồi. Không thể quay lại.');
      router.push('/result');
      return;
    }

    try {
      setLoading(true);
      const result = await resultsAPI.randomResult(ChosenTaskType.CLAIM_REWARD);
      
      // Update member info
      const updatedMember = await membersAPI.getMemberInfo();
      setMember(updatedMember);
      
      // Update cookies
      Cookies.set('member', JSON.stringify(updatedMember), { expires: 1 });
      
      router.push('/result');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi nhận thưởng');
      setLoading(false);
    }
  };

  const handleChooseTaskType = async (cardType: CardType) => {
    if (tasks[cardType] === 0) {
      setError(`Không còn task loại ${cardType} nào khả dụng`);
      return;
    }

    try {
      setLoading(true);
      const task = await tasksAPI.randomTask(cardType);
      
      // Update member info
      const updatedMember = await membersAPI.getMemberInfo();
      setMember(updatedMember);
      
      // Update cookies
      Cookies.set('member', JSON.stringify(updatedMember), { expires: 1 });
      
      router.push('/task-detail');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi chọn task');
      setLoading(false);
    }
  };

  if (loading && !member) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Đang tải...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexDirection: 'column-reverse',
        }}>
          <h1 className={styles.title}>Chọn Chương Trình</h1>

          {member?.IsAdmin && (
            <button
              onClick={() => router.push('/members')}
              style={{
                background: 'rgba(59, 130, 246, 0.3)',
                border: '1px solid rgba(59, 130, 246, 0.5)',
                color: '#60a5fa',
                padding: '10px 20px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.5)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              👥 Quản lý Members
            </button>
          )}
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.options}>
          <div className={styles.optionCard}>
            <h2 className={styles.optionTitle}>Thực hiện thử thách</h2>
            <p className={styles.optionDescription}>
              Chọn một loại thẻ và hoàn thành thử thách để nhận phần thưởng
            </p>

            <div className={styles.taskTypes}>
              <div className={styles.taskType}>
                <div className={`${styles.taskTypeCard} ${styles.red}`}>
                  <h3>🔴 RED</h3>
                  <p className={styles.taskDescription}>
                    - Có thể mở/xem phần thưởng của mình<br />
                    - Có thể trao đổi quà của mình với người khác
                  </p>
                  <button
                    onClick={() => handleChooseTaskType(CardType.RED)}
                    disabled={loading || (tasks[CardType.RED] || 0) === 0}
                    className={styles.taskButton}
                  >
                    Chọn RED {` (${tasks[CardType.RED] || 0})`}
                  </button>
                </div>
              </div>

              <div className={styles.taskType}>
                <div className={`${styles.taskTypeCard} ${styles.blue}`}>
                  <h3>🔵 BLUE</h3>
                  <p className={styles.taskDescription}>
                    - Có thể yêu cầu người khác mở quà của họ<br />
                    - Có thể trao đổi quà của mình với quà của họ
                  </p>
               
                  <button
                    onClick={() => handleChooseTaskType(CardType.BLUE)}
                    disabled={loading || (tasks[CardType.BLUE] || 0) === 0}
                    className={styles.taskButton}
                  >
                    Chọn BLUE {` (${tasks[CardType.BLUE] || 0})`}
                  </button>
                </div>
              </div>

              <div className={styles.taskType}>
                <div className={`${styles.taskTypeCard} ${styles.white}`}>
                  <h3>⚪ WHITE</h3>
                  <p className={styles.taskDescription}>
                    - Có thể chặn 1 tấn công RED  <br />
                    - Có thể chặn 1 tấn công BLUE 
                  </p>
                  <button
                    onClick={() => handleChooseTaskType(CardType.WHITE)}
                    disabled={loading || (tasks[CardType.WHITE] || 0) === 0}
                    className={styles.taskButton}
                  >
                    Chọn WHITE {` (${tasks[CardType.WHITE] || 0})`}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.optionCard}>
            <h2 className={styles.optionTitle}>Nhận thưởng ngay</h2>
            <p className={styles.optionDescription}>
              Nhận phần thưởng ngay lập tức mà không cần thực hiện thử thách
            </p>
            <button
              onClick={handleClaimReward}
              disabled={loading}
              className={styles.rewardButton}
            >
              Nhận Thưởng Ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

