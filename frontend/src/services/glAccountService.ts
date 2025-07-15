import api from './api';
import {
  GLAccount,
  CreateGLAccountDto,
  UpdateGLAccountDto,
  QueryGLAccountDto,
  GLAccountOption,
} from '../types/glAccount';
import { PaginatedResponse } from '../types/api';

const BASE_URL = '/gl-accounts';

export const glAccountService = {
  async create(dto: CreateGLAccountDto): Promise<GLAccount> {
    const { data } = await api.post<GLAccount>(BASE_URL, dto);
    return data;
  },

  async findAll(params: QueryGLAccountDto = {}): Promise<PaginatedResponse<GLAccount>> {
    const { data } = await api.get<PaginatedResponse<GLAccount>>(BASE_URL, { params });
    return data;
  },

  async findOne(id: string): Promise<GLAccount> {
    const { data } = await api.get<GLAccount>(`${BASE_URL}/${id}`);
    return data;
  },

  async findByCode(accountCode: string): Promise<GLAccount> {
    const { data } = await api.get<GLAccount>(`${BASE_URL}/code/${accountCode}`);
    return data;
  },

  async update(id: string, dto: UpdateGLAccountDto): Promise<GLAccount> {
    const { data } = await api.patch<GLAccount>(`${BASE_URL}/${id}`, dto);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`${BASE_URL}/${id}`);
  },

  async getAllAccounts(): Promise<GLAccount[]> {
    const { data } = await api.get<GLAccount[]>(`${BASE_URL}/all`);
    return data;
  },

  // Helper method to convert GL accounts to options for dropdowns
  convertToOptions(accounts: GLAccount[]): GLAccountOption[] {
    return accounts.map(account => ({
      label: `${account.accountCode} - ${account.accountName}`,
      value: account.id,
      accountCode: account.accountCode,
      accountName: account.accountName,
    }));
  },

  // Helper method to get all accounts as options
  async getAllAccountOptions(): Promise<GLAccountOption[]> {
    const accounts = await this.getAllAccounts();
    return this.convertToOptions(accounts);
  },
}; 