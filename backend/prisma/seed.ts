import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting GL Account seed...');

  // Clear existing data
  await prisma.purchaseOrderLineItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.gLAccount.deleteMany();

  // Create GL accounts
  await prisma.gLAccount.createMany({
    data: [
      // Asset accounts
      {
        accountCode: '1000',
        accountName: 'Cash',
        description: 'Cash and cash equivalents',
      },
      {
        accountCode: '1100',
        accountName: 'Accounts Receivable',
        description: 'Money owed by customers',
      },
      {
        accountCode: '1200',
        accountName: 'Inventory',
        description: 'Raw materials, work in progress, and finished goods',
      },
      {
        accountCode: '1300',
        accountName: 'Prepaid Expenses',
        description: 'Expenses paid in advance',
      },
      {
        accountCode: '1400',
        accountName: 'Fixed Assets',
        description: 'Property, plant, and equipment',
      },
      {
        accountCode: '1500',
        accountName: 'Accumulated Depreciation',
        description: 'Accumulated depreciation on fixed assets',
      },

      // Liability accounts
      {
        accountCode: '2000',
        accountName: 'Accounts Payable',
        description: 'Money owed to suppliers',
      },
      {
        accountCode: '2100',
        accountName: 'Accrued Expenses',
        description: 'Expenses incurred but not yet paid',
      },
      {
        accountCode: '2200',
        accountName: 'Notes Payable',
        description: 'Short-term and long-term loans',
      },
      {
        accountCode: '2300',
        accountName: 'Taxes Payable',
        description: 'Taxes owed to government',
      },

      // Equity accounts
      {
        accountCode: '3000',
        accountName: 'Owner Equity',
        description: 'Owner investment in the business',
      },
      {
        accountCode: '3100',
        accountName: 'Retained Earnings',
        description: 'Accumulated profits',
      },
      {
        accountCode: '3200',
        accountName: 'Common Stock',
        description: 'Common stock issued',
      },

      // Revenue accounts
      {
        accountCode: '4000',
        accountName: 'Sales Revenue',
        description: 'Revenue from product sales',
      },
      {
        accountCode: '4100',
        accountName: 'Service Revenue',
        description: 'Revenue from services',
      },
      {
        accountCode: '4200',
        accountName: 'Interest Income',
        description: 'Interest earned on investments',
      },
      {
        accountCode: '4300',
        accountName: 'Other Revenue',
        description: 'Other miscellaneous revenue',
      },

      // Expense accounts
      {
        accountCode: '5000',
        accountName: 'Cost of Goods Sold',
        description: 'Direct costs of producing goods',
      },
      {
        accountCode: '5100',
        accountName: 'Office Supplies',
        description: 'Office supplies and materials',
      },
      {
        accountCode: '5200',
        accountName: 'Rent Expense',
        description: 'Rent for office and warehouse space',
      },
      {
        accountCode: '5300',
        accountName: 'Utilities',
        description: 'Electricity, water, gas, and internet',
      },
      {
        accountCode: '5400',
        accountName: 'Salaries and Wages',
        description: 'Employee compensation',
      },
      {
        accountCode: '5500',
        accountName: 'Insurance',
        description: 'Business insurance premiums',
      },
      {
        accountCode: '5600',
        accountName: 'Depreciation Expense',
        description: 'Depreciation on fixed assets',
      },
      {
        accountCode: '5700',
        accountName: 'Advertising',
        description: 'Marketing and advertising expenses',
      },
      {
        accountCode: '5800',
        accountName: 'Travel and Entertainment',
        description: 'Business travel and entertainment expenses',
      },
      {
        accountCode: '5900',
        accountName: 'Professional Services',
        description: 'Legal, accounting, and consulting fees',
      },
    ],
  });

  console.log('✅ GL Account seed completed successfully!');
  console.log('📊 Created 30 GL accounts');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 