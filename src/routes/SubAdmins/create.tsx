import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Squares2X2Icon as LayoutDashboard,
  UserGroupIcon as SubAdminsIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../components/UI/PageHeader";
import {
  SubAdminForm,
  type SubAdminFormValues,
} from "../../components/Shared/SubAdminForm";
import { Skeleton } from "../../components/UI/Skeleton";
import api from "../../lib/axios";
import { toast } from "../../stores/toast";
import type { CatalogPermission } from "../../types/permissions";

const EMPTY: SubAdminFormValues = {
  full_name: "",
  email: "",
  phone: "",
  password: "",
  preferred_language: "ar",
  permissions: [],
};

export default function SubAdminCreate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [values, setValues] = useState<SubAdminFormValues>(EMPTY);
  const [options, setOptions] = useState<CatalogPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get("permissions");
        setOptions(res.data?.data?.permissions ?? []);
      } catch (e: any) {
        toast.error(
          t("MESSAGES.failedToLoadPermissions"),
          e?.response?.data?.message
        );
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [t]);

  const onSubmit = async () => {
    try {
      setSaving(true);
      const payload = {
        full_name: values.full_name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || undefined,
        password: values.password,
        preferred_language: values.preferred_language || undefined,
        permissions: values.permissions,
      };
      const res = await api.post("sub-admins", payload);
      toast.success(t("MESSAGES.createdSuccess"), res.data?.message);
      const id = res.data?.data?.id;
      navigate(id ? `/sub-admins/${id}` : "/sub-admins?page=1");
    } catch (e: any) {
      toast.error(t("MESSAGES.createFailed"), e?.response?.data?.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-0">
      <PageHeader
        title={t("TITLES.add", { entity: t("TITLES.subAdmin") })}
        translateTitle={false}
        icon={SubAdminsIcon}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          {
            label: "subAdmins",
            href: "/sub-admins?page=1",
            icon: SubAdminsIcon,
          },
          { label: t("ACTIONS.create"), icon: SubAdminsIcon },
        ]}
      />

      {loading ? (
        <Skeleton sections={[{ fields: [{}, {}, {}] }, { fields: [{}, {}] }]} />
      ) : (
        <SubAdminForm
          mode="create"
          values={values}
          onChange={setValues}
          permissionOptions={options}
          saving={saving}
          submitLabel={t("BUTTONS.save")}
          onCancel={() => navigate("/sub-admins?page=1")}
          onSubmit={onSubmit}
        />
      )}
    </div>
  );
}
