import api from './api';
import {
  PurchaseOrder,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  QueryPurchaseOrderDto,
} from '../types/purchaseOrder';
import { PaginatedResponse, PurchaseOrderResponse } from '../types/api';

const BASE_URL = '/purchase-orders';

export const purchaseOrderService = {
  
  async create(
    dto: CreatePurchaseOrderDto
  ): Promise<PurchaseOrder> {
    const { data } = await api.post<PurchaseOrder>(BASE_URL, dto);
    return data;
  },

  
  async findAll(
    params: QueryPurchaseOrderDto = {}
  ): Promise<PurchaseOrderResponse> {
    const { data } = await api.get<PurchaseOrderResponse>(BASE_URL, { params });
    return data;
  },


  async findOne(id: string): Promise<PurchaseOrder> {
    const { data } = await api.get<PurchaseOrder>(`${BASE_URL}/${id}`);
    return data;
  },

  
  async update(
    id: string,
    dto: UpdatePurchaseOrderDto
  ): Promise<PurchaseOrder> {
    const { data } = await api.patch<PurchaseOrder>(`${BASE_URL}/${id}`, dto);
    return data;
  },

  
  async remove(id: string): Promise<void> {
    await api.delete(`${BASE_URL}/${id}`);
  },
}; 