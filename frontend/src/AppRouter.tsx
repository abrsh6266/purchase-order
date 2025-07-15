import React from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";
import { PurchaseOrderListPage } from "./pages/PurchaseOrderListPage";
import { PurchaseOrderFormPage } from "./pages/PurchaseOrderFormPage";

export const AppRouter: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Routes>
      <Route path="/purchase-orders" element={<PurchaseOrderListPage />} />
      <Route
        path="/purchase-orders/:id"
        element={
          <PurchaseOrderFormPage
            onNavigateToList={() => navigate("/purchase-orders")}
          />
        }
      />

      <Route path="/" element={<Navigate to="/purchase-orders" replace />} />
    </Routes>
  );
};
