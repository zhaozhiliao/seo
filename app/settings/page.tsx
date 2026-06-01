import { KeyRound } from "lucide-react";
import ToolShell from "@/app/components/ToolShell";
import ApiManager from "@/app/components/ApiManager";

export default function SettingsPage() {
  return (
    <ToolShell
      title="API 管理"
      nameEn="API Settings"
      description="集中管理所有第三方 API 凭据。所有 Key 仅缓存在本地浏览器中，不会上传服务器。未来新增的各类 API 也会归集到这里。"
      icon={KeyRound}
    >
      <ApiManager />
    </ToolShell>
  );
}
