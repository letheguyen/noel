'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { membersAPI, resultsAPI } from '@/lib/api-client';
import { Member, Result, CardType } from '@/lib/types';
import styles from './page.module.css';

export default function ResultPage() {
  const [member, setMember] = useState<Member | null>(null);
  const [result, setResult] = useState<Result | null>(null);
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
      const memberInfo = await membersAPI.getMemberInfo();
      setMember(memberInfo);

      // If user is admin, redirect to members page
      if (memberInfo.IsAdmin) {
        router.push('/members');
        return;
      }

      // Check if member has result
      if (!memberInfo.ResultId) {
        // If no result and status is PENDING or CHOSEN, redirect to program selection
        if (memberInfo.Status === 'PENDING' || memberInfo.Status === 'CHOSEN') {
          router.push('/program-selection');
          return;
        }
        // If no result but has task, redirect to task detail
        if (memberInfo.TaskId) {
          router.push('/task-detail');
          return;
        }
        setError('Bạn chưa có phần thưởng');
        setLoading(false);
        return;
      }

      // Load result details
      const resultData = await resultsAPI.getResultDetails(memberInfo.ResultId);
      setResult(resultData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const getCardAbility = (cardType?: CardType): string => {
    switch (cardType) {
      case CardType.RED:
        return '🔴 RED: Có thể mở xem quà của mình mà không cần chờ tới khi chương trình kết thúc, có thể đổi quà của mình với bất kỳ ai ngay cả khi đã mở xem quà';
      case CardType.BLUE:
        return '🔵 BLUE: Có thể yêu cầu người khác mở quà và có thể đổi quà của mình với quà của người đó';
      case CardType.WHITE:
        return '⚪ WHITE: Bạn có thể chặn 1 tấn công/hành động từ RED/BLUE';
      default:
        return 'Chưa có loại thẻ';
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Đang tải...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Phần Thưởng Của Bạn</h1>

        {error && <div className={styles.error}>{error}</div>}

        {result && member && (
          <>
            <div className={styles.resultCard}>
              <div className={styles.resultNumber}>
                <h2>Mã Phần Thưởng</h2>
                <div className={styles.code}>{result.ResultNumber}</div>
              </div>
            </div>

            {member.CardType && (
              <div className={styles.cardInfo}>
                <h3 className={styles.cardTitle}>Bạn Nhận Được 1 Đặc Quyền</h3>
                <p className={styles.cardAbility}>
                  {getCardAbility(member.CardType)}
                </p>
              </div>
            )}

            <div className={styles.memberInfo}>
              <p><strong>Tên:</strong> {member.Name}</p>
              <p><strong>UUID:</strong> {member.UUID}</p>
              <p><strong>Trạng thái:</strong> {member.Status}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

