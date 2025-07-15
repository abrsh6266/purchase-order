import React, { useState, useEffect } from "react";
import { Card, Typography } from "antd";
import { PurchaseOrder } from "../types/purchaseOrder";
import { PurchaseOrderForm } from "../components/purchase-orders/PurchaseOrderForm";
import { LoadingSpinner, MessageBox } from "../components/common/index";
import { usePurchaseOrders } from "../hooks/usePurchaseOrders";
import {
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
} from "../types/purchaseOrder";
import { useParams } from "react-router-dom";

const { Title } = Typography;

interface PurchaseOrderFormPageProps {
  id?: string;
  onNavigateToList?: () => void;
}

export const PurchaseOrderFormPage: React.FC<PurchaseOrderFormPageProps> = ({
  onNavigateToList,
}) => {
  const { id } = useParams();
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const isEditing = id === "new" || id === undefined ? false : true;

  const {
    error,
    clearError,
    getPurchaseOrder,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder: deletePO,
  } = usePurchaseOrders({
    autoFetch: false,
  });

  useEffect(() => {
    if (id && isEditing) {
      fetchPurchaseOrder(id);
    }
  }, [id]);

  const fetchPurchaseOrder = async (purchaseOrderId: string) => {
    setLoading(true);

    try {
      const data = await getPurchaseOrder(purchaseOrderId);
      setPurchaseOrder(data);
    } catch (err) {
      // Error is already handled by the hook
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (
    data: CreatePurchaseOrderDto | UpdatePurchaseOrderDto
  ) => {
    setLoading(true);

    try {
      if (isEditing && id) {
        await updatePurchaseOrder(id, data as UpdatePurchaseOrderDto);
      } else {
        await createPurchaseOrder(data as CreatePurchaseOrderDto);
      }
      onNavigateToList?.();
    } catch (err) {
      // Error is already handled by the hook
      console.error("Save failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndNew = async (
    data: CreatePurchaseOrderDto | UpdatePurchaseOrderDto
  ) => {
    setLoading(true);

    try {
      if (isEditing && id) {
        await updatePurchaseOrder(id, data as UpdatePurchaseOrderDto);
      } else {
        await createPurchaseOrder(data as CreatePurchaseOrderDto);
      }
      // Navigate to new purchase order form
      window.location.href = '/purchase-orders/new';
    } catch (err) {
      // Error is already handled by the hook
      console.error("Save failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    setLoading(true);

    try {
      await deletePO(id);
      onNavigateToList?.();
    } catch (err) {
      // Error is already handled by the hook
      console.error("Delete failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <Card>
        <div className="mb-4 md:mb-6">
          <Title level={2} className="text-lg sm:text-xl md:text-2xl">
            {isEditing ? "Edit Purchase Order" : "New Purchase Order"}
          </Title>
        </div>

        <div className="relative">
          {loading && <LoadingSpinner />}

          {error && (
            <div className="mb-4">
              <MessageBox
                variant="error"
                message={error}
                closable
                onClose={clearError}
              />
            </div>
          )}

          <PurchaseOrderForm
            initialData={purchaseOrder}
            isEditing={isEditing}
            onSave={handleSave}
            onSaveAndNew={handleSaveAndNew}
            onDelete={handleDelete}
            onCancel={onNavigateToList}
            loading={loading}
          />
        </div>
      </Card>
    </div>
  );
};
