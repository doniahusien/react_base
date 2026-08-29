import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
import type { CatalogPermission, SubAdmin } from "../../types/permissions";

const EMPTY: SubAdminFormValues = {
  full_name: "",
  email: "",
  phone: "",
  password: "",
  preferred_language: "ar",
  permissions: [],
};

export default function SubAdminEdit() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [values, setValues] = useState<SubAdminFormValues>(EMPTY);
  const [options, setOptions] = useState<CatalogPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [showRes, catalogRes] = await Promise.all([
          api.get(`sub-admins/${id}`),
          api.get("permissions"),
        ]);
        const item = showRes.data?.data as SubAdmin | undefined;
        if (!item) {
          setNotFound(true);
          return;
        }
        const catalog: CatalogPermission[] =
          item.all_permissions?.length
            ? item.all_permissions
            : catalogRes.data?.data?.permissions ?? [];
        setOptions(catalog);
        setValues({
          full_name: item.full_name ?? "",
          email: item.email ?? "",
          phone: item.phone_number ?? "",
          password: "",
          preferred_language:
            item.preferred_language === "en" ? "en" : "ar",
          permissions: (item.permissions ?? []).map((p) => p.code),
        });
      } catch (e: any) {
        toast.error(
          t("MESSAGES.failedToLoadSubAdmins"),
          e?.response?.data?.message
        );
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, t]);

  const onSubmit = async () => {
    try {
      setSaving(true);
      const payload: Record<string, unknown> = {
        full_name: values.full_name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || null,
        preferred_language: values.preferred_language || undefined,
        permissions: values.permissions,
      };
      if (values.password.trim()) {
        payload.password = values.password;
      }
      const res = await api.put(`sub-admins/${id}`, payload);
      toast.success(t("MESSAGES.updatedSuccess"), res.data?.message);
      navigate(`/sub-admins/${id}`);
    } catch (e: any) {
      toast.error(t("MESSAGES.updateFailed"), e?.response?.data?.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton sections={[{ fields: [{}, {}, {}] }, { fields: [{}, {}] }]} />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="space-y-3 p-6">
        <p className="font-semibold text-foreground">{t("TITLES.notFound")}</p>
        <Link
          to="/sub-admins?page=1"
          className="text-sm text-primary hover:underline"
        >
          ← {t("TITLES.subAdmins")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <PageHeader
        title={t("TITLES.edit", { entity: t("TITLES.subAdmin") })}
        translateTitle={false}
        icon={SubAdminsIcon}
        path={[
          { label: "dashboard", href: "/", icon: LayoutDashboard },
          {
            label: "subAdmins",
            href: "/sub-admins?page=1",
            icon: SubAdminsIcon,
          },
          { label: t("ACTIONS.edit"), icon: SubAdminsIcon },
        ]}
      />
      <SubAdminForm
        mode="edit"
        values={values}
        onChange={setValues}
        permissionOptions={options}
        saving={saving}
        submitLabel={t("BUTTONS.saveChanges")}
        onCancel={() => navigate(`/sub-admins/${id}`)}
        onSubmit={onSubmit}
      />
    </div>
  );
}
