import { ImportTransactionsOpts } from '@actual-app/api';

import { Backup } from '../server/backups';
import { RemoteFile } from '../server/cloud-storage';
import { Node as SpreadsheetNode } from '../server/spreadsheet/spreadsheet';
import { Message } from '../server/sync';

import {
  AccountEntity,
  CategoryEntity,
  CategoryGroupEntity,
  GoCardlessToken,
  GoCardlessInstitution,
  SimpleFinAccount,
  RuleEntity,
  PayeeEntity,
} from './models';
import { OpenIdConfig } from './models/openid';
import { GlobalPrefs, MetadataPrefs } from './prefs';
// eslint-disable-next-line import/no-unresolved
import { Query } from './query';
import { EmptyObject } from './util';

export interface ServerHandlers {
  undo: () => Promise<void>;
  redo: () => Promise<void>;

  'get-categories': () => Promise<{
    grouped: Array<CategoryGroupEntity>;
    list: Array<CategoryEntity>;
  }>;

  'get-earliest-transaction': () => Promise<{ date: string }>;

  'get-budget-bounds': () => Promise<{ start: string; end: string }>;

  'envelope-budget-month': (arg: { month }) => Promise<
    {
      value: string | number | boolean;
      name: string;
    }[]
  >;

  'tracking-budget-month': (arg: { month }) => Promise<
    {
      value: string | number | boolean;
      name: string;
    }[]
  >;

  'category-create': (arg: {
    name;
    groupId;
    isIncome?;
    hidden?: boolean;
  }) => Promise<string>;

  'category-update': (category) => Promise<unknown>;

  'category-move': (arg: { id; groupId; targetId }) => Promise<unknown>;

  'category-delete': (arg: { id; transferId? }) => Promise<{ error?: string }>;

  'category-group-create': (arg: {
    name;
    isIncome?: boolean;
    hidden?: boolean;
  }) => Promise<string>;

  'category-group-update': (group) => Promise<unknown>;

  'category-group-move': (arg: { id; targetId }) => Promise<unknown>;

  'category-group-delete': (arg: { id; transferId }) => Promise<unknown>;

  'must-category-transfer': (arg: { id }) => Promise<unknown>;

  'payee-create': (arg: { name }) => Promise<string>;

  'common-payees-get': () => Promise<PayeeEntity[]>;

  'payees-get': () => Promise<PayeeEntity[]>;

  'payees-get-rule-counts': () => Promise<Record<PayeeEntity['id'], number>>;

  'payees-merge': (arg: { targetId; mergeIds }) => Promise<void>;

  'payees-batch-change': (arg: {
    added?;
    deleted?;
    updated?;
  }) => Promise<unknown>;

  'payees-check-orphaned': (arg: { ids }) => Promise<unknown>;
  'payees-get-orphaned': () => Promise<PayeeEntity[]>;

  'payees-get-rules': (arg: { id: string }) => Promise<RuleEntity[]>;

  'make-filters-from-conditions': (arg: {
    conditions: unknown;
    applySpecialCases?: boolean;
  }) => Promise<{ filters: unknown[] }>;

  getCell: (arg: { sheetName; name }) => Promise<{
    name: SpreadsheetNode['name'];
    value: SpreadsheetNode['value'];
  }>;

  getCells: (arg: {
    names;
  }) => Promise<
    Array<{ name: SpreadsheetNode['name']; value?: SpreadsheetNode['value'] }>
  >;

  getCellNamesInSheet: (arg: {
    sheetName;
  }) => Promise<Array<SpreadsheetNode['name']>>;

  debugCell: (arg: { sheetName; name }) => Promise<unknown>;

  'create-query': (arg: { sheetName; name; query }) => Promise<'ok'>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: (query: Query) => Promise<{ data: any; dependencies: string[] }>;

  'account-update': (arg: { id; name }) => Promise<unknown>;

  'accounts-get': () => Promise<AccountEntity[]>;

  'account-properties': (arg: {
    id;
  }) => Promise<{ balance: number; numTransactions: number }>;

  'gocardless-accounts-link': (arg: {
    requisitionId;
    account;
    upgradingId;
    offBudget;
  }) => Promise<'ok'>;

  'simplefin-accounts-link': (arg: {
    externalAccount;
    upgradingId;
    offBudget;
  }) => Promise<'ok'>;

  'account-create': (arg: {
    name: string;
    balance?: number;
    offBudget?: boolean;
    closed?: 0 | 1;
  }) => Promise<string>;

  'account-close': (arg: {
    id;
    transferAccountId?;
    categoryId?;
    forced?;
  }) => Promise<unknown>;

  'account-reopen': (arg: { id }) => Promise<unknown>;

  'account-move': (arg: { id; targetId }) => Promise<unknown>;

  'secret-set': (arg: {
    name: string;
    value: string | null;
  }) => Promise<{ error?: string; reason?: string }>;
  'secret-check': (arg: string) => Promise<string | { error?: string }>;

  'gocardless-poll-web-token': (arg: {
    upgradingAccountId?: string | undefined;
    requisitionId: string;
  }) => Promise<
    { error: 'unknown' } | { error: 'timeout' } | { data: GoCardlessToken }
  >;

  'gocardless-status': () => Promise<{ configured: boolean }>;

  'simplefin-status': () => Promise<{ configured: boolean }>;

  'simplefin-accounts': () => Promise<{
    accounts?: SimpleFinAccount[];
    error_code?: string;
    reason?: string;
  }>;

  'simplefin-batch-sync': ({ ids }: { ids: string[] }) => Promise<
    {
      accountId: string;
      res: {
        errors;
        newTransactions;
        matchedTransactions;
        updatedAccounts;
      };
    }[]
  >;

  'gocardless-get-banks': (country: string) => Promise<{
    data: GoCardlessInstitution[];
    error?: { reason: string };
  }>;

  'gocardless-poll-web-token-stop': () => Promise<'ok'>;

  'gocardless-create-web-token': (arg: {
    upgradingAccountId?: string | undefined;
    institutionId: string;
    accessValidForDays: number;
  }) => Promise<
    | {
        requisitionId: string;
        link: string;
      }
    | { error: 'unauthorized' }
    | { error: 'failed' }
  >;

  'accounts-bank-sync': (arg: { ids?: AccountEntity['id'][] }) => Promise<{
    errors;
    newTransactions;
    matchedTransactions;
    updatedAccounts;
  }>;

  'transactions-import': (arg: {
    accountId;
    transactions;
    isPreview;
    opts?: ImportTransactionsOpts;
  }) => Promise<{
    errors?: { message: string }[];
    added;
    updated;
    updatedPreview;
  }>;

  'account-unlink': (arg: { id }) => Promise<'ok'>;

  'save-global-prefs': (prefs) => Promise<'ok'>;

  'load-global-prefs': () => Promise<GlobalPrefs>;

  'save-prefs': (prefsToSet) => Promise<'ok'>;

  'load-prefs': () => Promise<MetadataPrefs | null>;

  'sync-reset': () => Promise<{ error?: { reason: string; meta?: unknown } }>;

  'sync-repair': () => Promise<unknown>;

  'key-make': (arg: {
    password;
  }) => Promise<{ error?: { reason: string; meta?: unknown } }>;

  'key-test': (arg: {
    fileId;
    password;
  }) => Promise<{ error?: { reason: string } }>;

  'get-did-bootstrap': () => Promise<boolean>;

  'subscribe-needs-bootstrap': (args: { url }) => Promise<
    | { error: string }
    | {
        bootstrapped: boolean;
        hasServer: false;
      }
    | {
        bootstrapped: boolean;
        hasServer: true;
        availableLoginMethods: {
          method: string;
          displayName: string;
          active: boolean;
        }[];
        multiuser: boolean;
      }
  >;

  'subscribe-get-login-methods': () => Promise<{
    methods?: { method: string; displayName: string; active: boolean }[];
    error?: string;
  }>;

  'subscribe-bootstrap': (arg: {
    password?: string;
    openId?: OpenIdConfig;
  }) => Promise<{ error?: string }>;

  'subscribe-get-user': () => Promise<{
    offline: boolean;
    userName?: string;
    userId?: string;
    displayName?: string;
    permission?: string;
    loginMethod?: string;
    tokenExpired?: boolean;
  } | null>;

  'subscribe-change-password': (arg: {
    password;
  }) => Promise<{ error?: string }>;

  'subscribe-sign-in': (
    arg:
      | {
          password;
          loginMethod?: string;
        }
      | {
          return_url;
          loginMethod?: 'openid';
        },
  ) => Promise<{ error?: string; redirect_url?: string }>;

  'subscribe-sign-out': () => Promise<'ok'>;

  'subscribe-set-token': (arg: { token: string }) => Promise<void>;

  'get-server-version': () => Promise<{ error?: string } | { version: string }>;

  'get-server-url': () => Promise<string | null>;

  'set-server-url': (arg: {
    url: string;
    validate?: boolean;
  }) => Promise<{ error?: string }>;

  sync: () => Promise<
    | { error: { message: string; reason: string; meta: unknown } }
    | { messages: Message[] }
  >;

  'get-remote-files': () => Promise<RemoteFile[]>;

  'get-user-file-info': (fileId: string) => Promise<RemoteFile | null>;

  'upload-file-web': (arg: {
    filename: string;
    contents: ArrayBuffer;
  }) => Promise<EmptyObject | null>;

  'backups-get': (arg: { id: string }) => Promise<Backup[]>;

  'backup-load': (arg: { id: string; backupId: string }) => Promise<void>;

  'backup-make': (arg: { id: string }) => Promise<void>;

  'get-last-opened-backup': () => Promise<string | null>;

  'app-focused': () => Promise<void>;

  'enable-openid': (arg: {
    openId?: OpenIdConfig;
  }) => Promise<{ error?: string }>;

  'enable-password': (arg: { password: string }) => Promise<{ error?: string }>;

  'get-openid-config': () => Promise<
    | {
        openId: OpenIdConfig;
      }
    | { error: string }
    | null
  >;
}
