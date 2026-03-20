import { useEffect, useState } from "react";
import {
  createMember,
  deleteMember,
  getMembers,
  updateMember,
} from "../api/member";
import type {
  Gender,
  MemberCreateRequest,
  MemberResponse,
  MemberType,
  MemberUpdateRequest,
} from "../types/member";
import MemberSearchBar from "../components/member/MemberSearchBar";
import MemberTable from "../components/member/MemberTable";
import MemberCreateModal from "../components/member/MemberCreateModal";
import MemberEditModal from "../components/member/MemberEditModal";
import MemberDetailsModal from "../components/member/MemberDetailsModal";
import { getErrorMessage } from "../utils/http";

interface Props {
  onBack: () => void;
}

export default function MemberManagementPage({ onBack }: Props) {
  const [members, setMembers] = useState<MemberResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<MemberResponse | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<MemberResponse | null>(
    null,
  );
  const [filters, setFilters] = useState<{
    name?: string;
    schoolName?: string;
    generation?: string;
    gender?: Gender;
    memberType?: MemberType;
  }>({});

  const loadMembers = async () => {
    setLoading(true);
    try {
      const page = await getMembers({
        ...filters,
        page: 0,
        size: 50,
        sort: "id,desc",
      });
      setMembers(page.content);
    } catch (error) {
      alert(getErrorMessage(error, "부원 목록 조회에 실패했습니다."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [filters]);

  const handleCreate = async (payload: MemberCreateRequest) => {
    try {
      await createMember(payload);
      await loadMembers();
    } catch (error) {
      alert(getErrorMessage(error, "부원 생성에 실패했습니다."));
    }
  };

  const handleEdit = async (memberId: number, payload: MemberUpdateRequest) => {
    try {
      await updateMember(memberId, payload);
      await loadMembers();
    } catch (error) {
      alert(getErrorMessage(error, "부원 수정에 실패했습니다."));
    }
  };

  const handleDelete = async (memberId: number) => {
    if (!window.confirm("이 부원를 삭제할까요?")) return;
    try {
      await deleteMember(memberId);
      await loadMembers();
    } catch (error) {
      alert(getErrorMessage(error, "부원 삭제에 실패했습니다."));
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="top-row">
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
              부원 관리
            </h1>
            <p className="muted" style={{ marginTop: 8 }}>
              부원 목록 조회 / 생성 / 수정 / 삭제
            </p>
          </div>
          <div className="top-actions">
            <button className="btn" onClick={onBack}>
              뒤로가기
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setOpenCreate(true)}
            >
              부원 추가
            </button>
          </div>
        </div>

        <MemberSearchBar onSearch={setFilters} />

        {loading ? (
          <div className="card">
            <div className="card-body">불러오는 중...</div>
          </div>
        ) : (
          <MemberTable
            members={members}
            onViewDetails={(member) => setDetailsTarget(member)}
          />
        )}

        <div className="spacer-top" />

        <MemberCreateModal
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          onSubmit={handleCreate}
        />

        <MemberEditModal
          open={!!editTarget}
          member={editTarget}
          onClose={() => setEditTarget(null)}
          onSubmit={handleEdit}
        />

        <MemberDetailsModal
          member={detailsTarget}
          onClose={() => setDetailsTarget(null)}
          onEdit={(member) => {
            setDetailsTarget(null);
            setEditTarget(member);
          }}
          onDelete={(memberId) => {
            setDetailsTarget(null);
            handleDelete(memberId);
          }}
        />
      </div>
    </div>
  );
}
