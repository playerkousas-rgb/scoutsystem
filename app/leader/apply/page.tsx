import { redirect } from 'next/navigation';

export default function LeaderApplyPage() {
  redirect('/apply?type=leader');
}
