// mock 假数据：严格按契约 v1.0 的字段形状（第 3 章）
// 覆盖点：USER + ADMIN 账号、ERROR / DISCONNECTED 记录、similarity 为 null 的来源

export const USERS = [
  { id: '1', username: 'admin', password: 'admin123', nickname: '管理员', role: 'ADMIN' },
  { id: '2', username: 'demo', password: 'demo1234', nickname: '演示用户', role: 'USER' },
  { id: '3', username: 'alice', password: 'alice123', nickname: '爱丽丝', role: 'USER' }
]

// 历史记录 sources 为 camelCase：docId / sourceFile / page / similarity / rank
export const QA_RECORDS = [
  {
    id: '1001',
    userId: '2',
    question: '员工年假有几天？',
    answer:
      '根据《员工考勤管理制度》第三章，正式员工入职满一年后享有 5 天带薪年假，满十年享有 10 天，满二十年享有 15 天。年假需提前 3 个工作日在 OA 系统申请。',
    status: 'SUCCESS',
    latencyMs: 3210,
    createTime: '2026-11-05 15:30:00',
    sources: [
      {
        docId: 'd1',
        sourceFile: '员工考勤管理制度.pdf',
        page: 3,
        chunk: '第三章 休假管理……正式员工累计工作满一年不满十年的，年休假 5 天；满十年不满二十年的，年休假 10 天；满二十年的，年休假 15 天。',
        similarity: 0.82,
        rank: 1
      },
      {
        docId: 'd1',
        sourceFile: '员工考勤管理制度.pdf',
        page: 4,
        chunk: '年休假申请应至少提前 3 个工作日在 OA 系统提交，经直属上级审批后生效。',
        similarity: 0.71,
        rank: 2
      }
    ]
  },
  {
    id: '1002',
    userId: '2',
    question: '报销流程是什么？',
    answer:
      '差旅报销需在出差结束后 15 日内提交：① 在 OA 填写报销单并上传发票；② 直属上级审批；③ 财务复核；④ 打款至工资卡。单笔超过 5000 元需部门负责人二次审批。',
    status: 'SUCCESS',
    latencyMs: 2860,
    createTime: '2026-11-04 10:12:31',
    sources: [
      {
        docId: 'd2',
        sourceFile: '财务报销手册.docx',
        page: 1,
        chunk: '出差结束后 15 日内，员工应在 OA 系统提交差旅报销申请，并上传合规发票原件扫描件。',
        similarity: null,
        rank: 1
      }
    ]
  },
  {
    id: '1003',
    userId: '2',
    question: '公司年会什么时候举办？',
    answer: '',
    status: 'ERROR',
    latencyMs: 912,
    createTime: '2026-11-03 18:00:12',
    sources: []
  },
  {
    id: '1004',
    userId: '3',
    question: '信息安全培训怎么参加？',
    answer: '',
    status: 'DISCONNECTED',
    latencyMs: 1503,
    createTime: '2026-11-02 09:05:44',
    sources: []
  }
]

// 文档接口已由 Java 统一为 camelCase
export const DOCUMENTS = [
  {
    docId: 'd1',
    filename: '员工考勤管理制度.pdf',
    originalFilename: '员工考勤管理制度.pdf',
    size: 96737,
    contentType: 'application/pdf',
    uploadTime: '2026-09-21T19:12:58',
    chunkCount: 2,
    pageCount: 2,
    ext: 'pdf',
    status: 'ready'
  },
  {
    docId: 'd2',
    filename: '财务报销手册.docx',
    originalFilename: '财务报销手册.docx',
    size: 48210,
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    uploadTime: '2026-09-22T09:40:11',
    chunkCount: 1,
    pageCount: 1,
    ext: 'docx',
    status: 'ready'
  },
  {
    docId: 'd3',
    filename: '信息安全管理办法.pdf',
    originalFilename: '信息安全管理办法.pdf',
    size: 153204,
    contentType: 'application/pdf',
    uploadTime: '2026-10-08T14:22:03',
    chunkCount: 5,
    pageCount: 3,
    ext: 'pdf',
    status: 'ready'
  }
]