export const mockCustomers = [
  {
    id: 'cust_001',
    name: '张先生 & 李女士',
    phone: '13800138001',
    wechat: 'zhang_li_wedding',
    weddingDate: '2026-05-20',
    hotel: '上海外滩华尔道夫酒店',
    source: 'official',
    referralName: '',
    remark: '客户喜欢自然清新风格，外景想拍外滩和豫园',
    followUpRecords: [
      {
        id: 'fur_c001',
        type: 'wechat',
        content: '官网咨询，初次沟通需求',
        status: 'contacting',
        createdAt: '2026-01-10T10:00:00.000Z'
      },
      {
        id: 'fur_c002',
        type: 'meeting',
        content: '面谈，确定豪华套系，付定金5000元',
        status: 'converted',
        createdAt: '2026-01-15T10:30:00.000Z'
      }
    ],
    createdAt: '2026-01-15T10:30:00.000Z'
  },
  {
    id: 'cust_002',
    name: '王先生 & 陈小姐',
    phone: '13900139002',
    wechat: 'wangchen2026',
    weddingDate: '2026-06-18',
    hotel: '北京瑰丽酒店',
    source: 'xiaohongshu',
    referralName: '',
    remark: '预算充足，希望拍一套高端定制',
    followUpRecords: [
      {
        id: 'fur_c003',
        type: 'phone',
        content: '小红书咨询，对尊享套系感兴趣',
        status: 'contacting',
        createdAt: '2026-01-25T14:00:00.000Z'
      },
      {
        id: 'fur_c004',
        type: 'wechat',
        content: '微信沟通细节，发了客片作品集',
        status: 'quoted',
        createdAt: '2026-01-28T11:00:00.000Z'
      },
      {
        id: 'fur_c005',
        type: 'meeting',
        content: '约见客户，确认尊享套系，付定金10000元',
        status: 'converted',
        createdAt: '2026-02-01T14:20:00.000Z'
      }
    ],
    createdAt: '2026-02-01T14:20:00.000Z'
  },
  {
    id: 'cust_003',
    name: '刘先生 & 周女士',
    phone: '13700137003',
    wechat: 'liuzhou_love',
    weddingDate: '2026-04-25',
    hotel: '杭州西子湖四季酒店',
    source: 'dianping',
    referralName: '',
    remark: '喜欢复古风格，想要一套中式秀禾服造型',
    followUpRecords: [
      {
        id: 'fur_c006',
        type: 'wechat',
        content: '大众点评咨询，问了价格',
        status: 'contacting',
        createdAt: '2026-01-15T09:00:00.000Z'
      },
      {
        id: 'fur_c007',
        type: 'phone',
        content: '电话沟通，推荐豪华套系',
        status: 'quoted',
        createdAt: '2026-01-18T15:00:00.000Z'
      },
      {
        id: 'fur_c008',
        type: 'meeting',
        content: '到店详谈，确认豪华套系，付定金5000元',
        status: 'converted',
        createdAt: '2026-01-20T09:15:00.000Z'
      }
    ],
    createdAt: '2026-01-20T09:15:00.000Z'
  },
  {
    id: 'cust_004',
    name: '赵先生 & 孙小姐',
    phone: '13600136004',
    wechat: 'zhao_sun',
    weddingDate: '2026-07-10',
    hotel: '深圳湾安达仕酒店',
    source: 'douyin',
    referralName: '',
    remark: '海景拍摄，下午户外仪式',
    followUpRecords: [
      {
        id: 'fur_c009',
        type: 'wechat',
        content: '抖音私信咨询',
        status: 'contacting',
        createdAt: '2026-02-05T16:00:00.000Z'
      },
      {
        id: 'fur_c010',
        type: 'phone',
        content: '电话回访，客户对经典套系感兴趣',
        status: 'quoted',
        createdAt: '2026-02-08T10:00:00.000Z'
      }
    ],
    createdAt: '2026-02-10T16:45:00.000Z'
  },
  {
    id: 'cust_005',
    name: '黄先生 & 吴女士',
    phone: '13500135005',
    wechat: 'huang_wu',
    weddingDate: '2026-03-08',
    hotel: '广州四季酒店',
    source: 'referral',
    referralName: '李女士（老客户）',
    remark: '老客户介绍，已付定金',
    followUpRecords: [
      {
        id: 'fur_c011',
        type: 'phone',
        content: '老客户李女士介绍，初次电话沟通',
        status: 'contacting',
        createdAt: '2025-12-15T10:00:00.000Z'
      },
      {
        id: 'fur_c012',
        type: 'meeting',
        content: '见面详谈，经典套系，付定金3000元',
        status: 'converted',
        createdAt: '2025-12-20T11:00:00.000Z'
      }
    ],
    createdAt: '2025-12-20T11:00:00.000Z'
  }
]

export const mockPackages = [
  {
    id: 'pkg_001',
    name: '经典套系',
    price: 8888,
    duration: '8小时',
    refinedCount: 50,
    content: '1位首席摄影师全程跟拍\n50张精修照片\n10秒短视频\n在线选片',
    remark: '最受欢迎的基础套餐',
    active: true,
    createdAt: '2025-11-01T00:00:00.000Z'
  },
  {
    id: 'pkg_002',
    name: '豪华套系',
    price: 15888,
    duration: '12小时',
    refinedCount: 100,
    content: '1位总监摄影师+1位助理全程跟拍\n100张精修照片\n30秒微电影\n精美相册一本\n全天跟拍含夜景',
    remark: '高端客户首选',
    active: true,
    createdAt: '2025-11-01T00:00:00.000Z'
  },
  {
    id: 'pkg_003',
    name: '尊享套系',
    price: 28888,
    duration: '全天不限时',
    refinedCount: 200,
    content: '1位创始人+2位助理全程跟拍\n200张精修照片\n2分钟爱情微电影\n豪华皮质相册两本\n48小时抢先看\n婚前微电影拍摄',
    remark: '顶级定制服务',
    active: true,
    createdAt: '2025-11-01T00:00:00.000Z'
  },
  {
    id: 'pkg_004',
    name: '旅拍套系',
    price: 36888,
    duration: '2天',
    refinedCount: 150,
    content: '总监摄影师2天跟拍\n150张精修照片\n1分钟旅拍微电影\n含摄影师交通住宿\n异地旅拍服务',
    remark: '三亚/大理/丽江可选',
    active: false,
    createdAt: '2025-12-01T00:00:00.000Z'
  }
]

export const mockOrders = [
  {
    id: 'ord_001',
    customerId: 'cust_005',
    packageId: 'pkg_001',
    shootDate: '2026-03-08',
    status: 'completed',
    depositAmount: 3000,
    finalAmount: 5888,
    paidAmount: 8888,
    paymentStatus: 'paid',
    dueDate: '2026-03-01',
    remark: '老客户介绍，当天流程顺畅',
    createdAt: '2025-12-20T11:00:00.000Z'
  },
  {
    id: 'ord_002',
    customerId: 'cust_003',
    packageId: 'pkg_002',
    shootDate: '2026-04-25',
    status: 'selecting',
    depositAmount: 5000,
    finalAmount: 10888,
    paidAmount: 5000,
    paymentStatus: 'partial',
    dueDate: '2026-04-20',
    remark: '中式+西式两套造型，待客户结清尾款后进入精修',
    createdAt: '2026-01-20T09:15:00.000Z'
  },
  {
    id: 'ord_003',
    customerId: 'cust_001',
    packageId: 'pkg_002',
    shootDate: '2026-05-20',
    status: 'confirmed',
    depositAmount: 5000,
    finalAmount: 10888,
    paidAmount: 5000,
    paymentStatus: 'partial',
    dueDate: '2026-05-15',
    remark: '外滩夜景要拍，客户很重视',
    createdAt: '2026-01-15T10:30:00.000Z'
  },
  {
    id: 'ord_004',
    customerId: 'cust_002',
    packageId: 'pkg_003',
    shootDate: '2026-06-18',
    status: 'confirmed',
    depositAmount: 10000,
    finalAmount: 18888,
    paidAmount: 10000,
    paymentStatus: 'partial',
    dueDate: '2026-06-10',
    remark: '高端客户，需要提前沟通细节',
    createdAt: '2026-02-01T14:20:00.000Z'
  },
  {
    id: 'ord_005',
    customerId: 'cust_004',
    packageId: 'pkg_001',
    shootDate: '2026-07-10',
    status: 'pending',
    depositAmount: 0,
    finalAmount: 8888,
    paidAmount: 0,
    paymentStatus: 'unpaid',
    dueDate: '2026-07-01',
    remark: '初步咨询，还在比较中',
    createdAt: '2026-02-10T16:45:00.000Z'
  },
  {
    id: 'ord_006',
    customerId: 'cust_001',
    packageId: 'pkg_001',
    shootDate: '2026-02-28',
    status: 'delivering',
    depositAmount: 3000,
    finalAmount: 5888,
    paidAmount: 8888,
    paymentStatus: 'paid',
    dueDate: '2026-02-20',
    remark: '补拍的一套登记照',
    createdAt: '2026-01-25T10:00:00.000Z'
  },
  {
    id: 'ord_007',
    customerId: 'cust_003',
    packageId: 'pkg_003',
    shootDate: '2026-05-01',
    status: 'shooting',
    depositAmount: 10000,
    finalAmount: 18888,
    paidAmount: 10000,
    paymentStatus: 'partial',
    dueDate: '2026-04-25',
    remark: '五一假期，客户加订了婚纱写真',
    createdAt: '2026-03-01T09:00:00.000Z'
  },
  {
    id: 'ord_008',
    customerId: 'cust_001',
    packageId: 'pkg_002',
    shootDate: '2026-06-06',
    status: 'confirmed',
    depositAmount: 5000,
    finalAmount: 10888,
    paidAmount: 5000,
    paymentStatus: 'partial',
    dueDate: '2026-06-01',
    remark: '客户加拍的一套内景',
    createdAt: '2026-04-10T10:00:00.000Z'
  },
  {
    id: 'ord_009',
    customerId: 'cust_003',
    packageId: 'pkg_002',
    shootDate: '2026-06-13',
    status: 'confirmed',
    depositAmount: 5000,
    finalAmount: 10888,
    paidAmount: 10888,
    paymentStatus: 'paid',
    dueDate: '2026-06-08',
    remark: '客户推荐的朋友',
    createdAt: '2026-04-15T11:00:00.000Z'
  },
  {
    id: 'ord_010',
    customerId: 'cust_005',
    packageId: 'pkg_001',
    shootDate: '2026-06-20',
    status: 'confirmed',
    depositAmount: 3000,
    finalAmount: 5888,
    paidAmount: 8888,
    paymentStatus: 'paid',
    dueDate: '2026-06-15',
    remark: '老客户介绍，全款已付',
    createdAt: '2026-05-02T09:30:00.000Z'
  },
  {
    id: 'ord_011',
    customerId: 'cust_002',
    packageId: 'pkg_003',
    shootDate: '2026-06-25',
    status: 'pending',
    depositAmount: 10000,
    finalAmount: 18888,
    paidAmount: 10000,
    paymentStatus: 'partial',
    dueDate: '2026-06-20',
    remark: '朋友介绍，档期暂未最终确定',
    createdAt: '2026-05-08T14:00:00.000Z'
  },
  {
    id: 'ord_012',
    customerId: 'cust_004',
    packageId: 'pkg_001',
    shootDate: '2026-06-09',
    status: 'confirmed',
    depositAmount: 3000,
    finalAmount: 5888,
    paidAmount: 3000,
    paymentStatus: 'partial',
    dueDate: '2026-06-05',
    remark: '海景拍摄',
    createdAt: '2026-05-10T10:00:00.000Z'
  },
  {
    id: 'ord_013',
    customerId: 'cust_001',
    packageId: 'pkg_002',
    shootDate: '2026-06-22',
    status: 'confirmed',
    depositAmount: 5000,
    finalAmount: 10888,
    paidAmount: 5000,
    paymentStatus: 'partial',
    dueDate: '2026-06-18',
    remark: '闺蜜推荐的客户',
    createdAt: '2026-05-12T11:00:00.000Z'
  },
  {
    id: 'ord_014',
    customerId: 'cust_003',
    packageId: 'pkg_001',
    shootDate: '2026-06-28',
    status: 'pending',
    depositAmount: 3000,
    finalAmount: 5888,
    paidAmount: 3000,
    paymentStatus: 'partial',
    dueDate: '2026-06-23',
    remark: '老客户复购',
    createdAt: '2026-05-15T09:00:00.000Z'
  },
  {
    id: 'ord_015',
    customerId: 'cust_005',
    packageId: 'pkg_003',
    shootDate: '2026-06-11',
    status: 'shooting',
    depositAmount: 10000,
    finalAmount: 18888,
    paidAmount: 28888,
    paymentStatus: 'paid',
    dueDate: '2026-06-06',
    remark: '老客户，高端定制',
    createdAt: '2026-04-20T10:00:00.000Z'
  }
]

export const mockCosts = [
  {
    id: 'cost_001',
    orderId: 'ord_001',
    date: '2026-03-08',
    type: 'transport',
    amount: 200,
    remark: '往返打车费'
  },
  {
    id: 'cost_002',
    orderId: 'ord_001',
    date: '2026-03-08',
    type: 'food',
    amount: 150,
    remark: '工作餐'
  },
  {
    id: 'cost_003',
    orderId: 'ord_002',
    date: '2026-04-20',
    type: 'transport',
    amount: 500,
    remark: '高铁往返杭州'
  },
  {
    id: 'cost_004',
    orderId: 'ord_002',
    date: '2026-04-24',
    type: 'accommodation',
    amount: 800,
    remark: '酒店一晚'
  },
  {
    id: 'cost_005',
    orderId: 'ord_003',
    date: '2026-05-15',
    type: 'equipment',
    amount: 300,
    remark: '租赁镜头'
  },
  {
    id: 'cost_006',
    orderId: 'ord_004',
    date: '2026-06-15',
    type: 'transport',
    amount: 1200,
    remark: '北京往返机票'
  },
  {
    id: 'cost_007',
    orderId: 'ord_004',
    date: '2026-06-17',
    type: 'accommodation',
    amount: 1500,
    remark: '两晚酒店'
  }
]

export const mockLeads = [
  {
    id: 'lead_001',
    name: '林先生 & 何小姐',
    phone: '13811138111',
    wechat: 'linhe_wedding',
    source: 'xiaohongshu',
    referralName: '',
    status: 'new',
    weddingDate: '2026-10-01',
    hotel: '',
    budget: 15000,
    packageInterest: '',
    remark: '小红书咨询，对复古风格感兴趣',
    nextFollowUp: '2026-06-13',
    followUpRecords: [],
    customerId: null,
    orderId: null,
    createdAt: '2026-06-10T09:30:00.000Z',
    updatedAt: '2026-06-10T09:30:00.000Z'
  },
  {
    id: 'lead_002',
    name: '陈先生 & 林女士',
    phone: '13922239222',
    wechat: 'chenlin2026',
    source: 'referral',
    referralName: '王女士（老客户）',
    status: 'contacting',
    weddingDate: '2026-08-18',
    hotel: '成都瑞吉酒店',
    budget: 20000,
    packageInterest: 'pkg_002',
    remark: '老客户王女士介绍，预算充足',
    nextFollowUp: '2026-06-12',
    followUpRecords: [
      {
        id: 'fur_001',
        type: 'phone',
        content: '首次电话沟通，客户对豪华套系感兴趣，婚期定在8月18日，酒店已确定',
        status: 'contacting',
        nextFollowUp: '2026-06-12',
        createdAt: '2026-06-08T14:00:00.000Z'
      }
    ],
    customerId: null,
    orderId: null,
    createdAt: '2026-06-05T16:20:00.000Z',
    updatedAt: '2026-06-08T14:00:00.000Z'
  },
  {
    id: 'lead_003',
    name: '吴先生 & 郑小姐',
    phone: '13733337333',
    wechat: 'wuzheng_love',
    source: 'dianping',
    referralName: '',
    status: 'quoted',
    weddingDate: '2026-09-09',
    hotel: '苏州金鸡湖大酒店',
    budget: 12000,
    packageInterest: 'pkg_001',
    remark: '大众点评来的，价格比较敏感',
    nextFollowUp: '2026-06-15',
    followUpRecords: [
      {
        id: 'fur_002',
        type: 'wechat',
        content: '微信沟通，发了经典套系报价，客户说和家人商量一下',
        status: 'quoted',
        nextFollowUp: '2026-06-12',
        createdAt: '2026-06-06T10:30:00.000Z'
      },
      {
        id: 'fur_003',
        type: 'phone',
        content: '电话回访，客户表示预算有点超，问能不能优惠，说再考虑下',
        status: 'quoted',
        nextFollowUp: '2026-06-15',
        createdAt: '2026-06-09T15:00:00.000Z'
      }
    ],
    customerId: null,
    orderId: null,
    createdAt: '2026-06-03T11:15:00.000Z',
    updatedAt: '2026-06-09T15:00:00.000Z'
  },
  {
    id: 'lead_004',
    name: '黄先生 & 徐女士',
    phone: '13644446444',
    wechat: 'huangxu',
    source: 'douyin',
    referralName: '',
    status: 'negotiating',
    weddingDate: '2026-07-22',
    hotel: '南京金陵饭店',
    budget: 25000,
    packageInterest: 'pkg_003',
    remark: '抖音咨询，对尊享套系很感兴趣',
    nextFollowUp: '2026-06-11',
    followUpRecords: [
      {
        id: 'fur_004',
        type: 'meeting',
        content: '约了面谈，聊了2小时，客户很满意风格，预算也OK，就是婚期有点赶',
        status: 'negotiating',
        nextFollowUp: '2026-06-11',
        createdAt: '2026-06-07T16:00:00.000Z'
      }
    ],
    customerId: null,
    orderId: null,
    createdAt: '2026-06-01T08:45:00.000Z',
    updatedAt: '2026-06-07T16:00:00.000Z'
  },
  {
    id: 'lead_005',
    name: '周先生 & 蔡小姐',
    phone: '13555555555',
    wechat: 'zhoucai',
    source: 'official',
    referralName: '',
    status: 'converted',
    weddingDate: '2026-05-20',
    hotel: '上海外滩华尔道夫酒店',
    budget: 18000,
    packageInterest: 'pkg_002',
    remark: '官网咨询，已转化为客户',
    nextFollowUp: null,
    followUpRecords: [
      {
        id: 'fur_005',
        type: 'wechat',
        content: '初次沟通，了解需求',
        status: 'contacting',
        nextFollowUp: '2026-04-05',
        createdAt: '2026-04-01T10:00:00.000Z'
      },
      {
        id: 'fur_006',
        type: 'phone',
        content: '报价后确认订单，已付定金',
        status: 'converted',
        nextFollowUp: null,
        createdAt: '2026-04-08T14:30:00.000Z'
      }
    ],
    customerId: 'cust_001',
    orderId: 'ord_003',
    createdAt: '2026-04-01T10:00:00.000Z',
    updatedAt: '2026-04-08T14:30:00.000Z'
  },
  {
    id: 'lead_006',
    name: '许先生 & 韩女士',
    phone: '13466664666',
    wechat: 'xuhan',
    source: 'xiaohongshu',
    referralName: '',
    status: 'lost',
    weddingDate: '2026-06-01',
    hotel: '',
    budget: 8000,
    packageInterest: '',
    remark: '预算太低，选择了其他工作室',
    nextFollowUp: null,
    followUpRecords: [
      {
        id: 'fur_007',
        type: 'wechat',
        content: '简单沟通后报价，客户说价格高了再考虑',
        status: 'quoted',
        nextFollowUp: '2026-05-10',
        createdAt: '2026-05-05T11:20:00.000Z'
      },
      {
        id: 'fur_008',
        type: 'phone',
        content: '回访说已经定了别家，价格便宜一些',
        status: 'lost',
        nextFollowUp: null,
        createdAt: '2026-05-12T09:30:00.000Z'
      }
    ],
    customerId: null,
    orderId: null,
    createdAt: '2026-05-02T13:00:00.000Z',
    updatedAt: '2026-05-12T09:30:00.000Z'
  }
]

export const mockStaff = [
  {
    id: 'staff_001',
    name: '陈伟',
    role: 'photographer',
    phone: '13800001001',
    active: true,
    remark: '首席摄影师，擅长纪实风格',
    createdAt: '2025-11-01T00:00:00.000Z'
  },
  {
    id: 'staff_002',
    name: '李婷',
    role: 'photographer',
    phone: '13800001002',
    active: true,
    remark: '女摄影师，擅长中式复古',
    createdAt: '2025-11-01T00:00:00.000Z'
  },
  {
    id: 'staff_003',
    name: '王磊',
    role: 'assistant',
    phone: '13800001003',
    active: true,
    remark: '摄影助理，负责灯光和器材',
    createdAt: '2025-12-01T00:00:00.000Z'
  },
  {
    id: 'staff_004',
    name: '赵敏',
    role: 'makeup',
    phone: '13800001004',
    active: true,
    remark: '首席化妆师，8年经验',
    createdAt: '2025-11-01T00:00:00.000Z'
  },
  {
    id: 'staff_005',
    name: '刘洋',
    role: 'videographer',
    phone: '13800001005',
    active: true,
    remark: '摄像师，负责微电影拍摄',
    createdAt: '2025-12-15T00:00:00.000Z'
  },
  {
    id: 'staff_006',
    name: '孙浩',
    role: 'assistant',
    phone: '13800001006',
    active: false,
    remark: '兼职助理，周末可排班',
    createdAt: '2026-01-10T00:00:00.000Z'
  }
]

export const mockAssignments = [
  {
    id: 'asgn_001',
    orderId: 'ord_001',
    staffId: 'staff_001',
    date: '2026-03-08',
    role: 'chief_photographer',
    status: 'completed',
    remark: '',
    createdAt: '2026-03-01T10:00:00.000Z'
  },
  {
    id: 'asgn_002',
    orderId: 'ord_001',
    staffId: 'staff_003',
    date: '2026-03-08',
    role: 'assistant',
    status: 'completed',
    remark: '',
    createdAt: '2026-03-01T10:00:00.000Z'
  },
  {
    id: 'asgn_003',
    orderId: 'ord_001',
    staffId: 'staff_004',
    date: '2026-03-08',
    role: 'makeup_artist',
    status: 'completed',
    remark: '',
    createdAt: '2026-03-01T10:00:00.000Z'
  },
  {
    id: 'asgn_004',
    orderId: 'ord_002',
    staffId: 'staff_002',
    date: '2026-04-25',
    role: 'chief_photographer',
    status: 'confirmed',
    remark: '中式复古拍摄',
    createdAt: '2026-02-01T10:00:00.000Z'
  },
  {
    id: 'asgn_005',
    orderId: 'ord_002',
    staffId: 'staff_003',
    date: '2026-04-25',
    role: 'assistant',
    status: 'confirmed',
    remark: '',
    createdAt: '2026-02-01T10:00:00.000Z'
  },
  {
    id: 'asgn_006',
    orderId: 'ord_002',
    staffId: 'staff_004',
    date: '2026-04-25',
    role: 'makeup_artist',
    status: 'confirmed',
    remark: '',
    createdAt: '2026-02-01T10:00:00.000Z'
  },
  {
    id: 'asgn_007',
    orderId: 'ord_003',
    staffId: 'staff_001',
    date: '2026-05-20',
    role: 'chief_photographer',
    status: 'confirmed',
    remark: '外滩夜景拍摄',
    createdAt: '2026-02-01T10:00:00.000Z'
  },
  {
    id: 'asgn_008',
    orderId: 'ord_003',
    staffId: 'staff_005',
    date: '2026-05-20',
    role: 'videographer',
    status: 'confirmed',
    remark: '',
    createdAt: '2026-02-01T10:00:00.000Z'
  },
  {
    id: 'asgn_009',
    orderId: 'ord_004',
    staffId: 'staff_001',
    date: '2026-06-18',
    role: 'chief_photographer',
    status: 'pending',
    remark: '尊享套系',
    createdAt: '2026-03-01T10:00:00.000Z'
  },
  {
    id: 'asgn_010',
    orderId: 'ord_004',
    staffId: 'staff_003',
    date: '2026-06-18',
    role: 'assistant',
    status: 'pending',
    remark: '',
    createdAt: '2026-03-01T10:00:00.000Z'
  },
  {
    id: 'asgn_011',
    orderId: 'ord_004',
    staffId: 'staff_004',
    date: '2026-06-18',
    role: 'makeup_artist',
    status: 'pending',
    remark: '',
    createdAt: '2026-03-01T10:00:00.000Z'
  },
  {
    id: 'asgn_012',
    orderId: 'ord_004',
    staffId: 'staff_005',
    date: '2026-06-18',
    role: 'videographer',
    status: 'pending',
    remark: '',
    createdAt: '2026-03-01T10:00:00.000Z'
  },
  {
    id: 'asgn_013',
    orderId: 'ord_007',
    staffId: 'staff_002',
    date: '2026-05-01',
    role: 'chief_photographer',
    status: 'confirmed',
    remark: '',
    createdAt: '2026-03-05T10:00:00.000Z'
  },
  {
    id: 'asgn_014',
    orderId: 'ord_007',
    staffId: 'staff_003',
    date: '2026-05-01',
    role: 'assistant',
    status: 'confirmed',
    remark: '',
    createdAt: '2026-03-05T10:00:00.000Z'
  },
  {
    id: 'asgn_015',
    orderId: 'ord_008',
    staffId: 'staff_001',
    date: '2026-06-06',
    role: 'chief_photographer',
    status: 'confirmed',
    remark: '客户加拍内景',
    createdAt: '2026-04-10T10:00:00.000Z'
  },
  {
    id: 'asgn_016',
    orderId: 'ord_008',
    staffId: 'staff_004',
    date: '2026-06-06',
    role: 'makeup_artist',
    status: 'confirmed',
    remark: '',
    createdAt: '2026-04-10T10:00:00.000Z'
  },
  {
    id: 'asgn_017',
    orderId: 'ord_009',
    staffId: 'staff_001',
    date: '2026-06-13',
    role: 'chief_photographer',
    status: 'confirmed',
    remark: '',
    createdAt: '2026-04-15T11:00:00.000Z'
  },
  {
    id: 'asgn_018',
    orderId: 'ord_009',
    staffId: 'staff_003',
    date: '2026-06-13',
    role: 'assistant',
    status: 'confirmed',
    remark: '',
    createdAt: '2026-04-15T11:00:00.000Z'
  },
  {
    id: 'asgn_019',
    orderId: 'ord_009',
    staffId: 'staff_004',
    date: '2026-06-13',
    role: 'makeup_artist',
    status: 'confirmed',
    remark: '',
    createdAt: '2026-04-15T11:00:00.000Z'
  },
  {
    id: 'asgn_020',
    orderId: 'ord_010',
    staffId: 'staff_001',
    date: '2026-06-20',
    role: 'chief_photographer',
    status: 'confirmed',
    remark: '老客户介绍',
    createdAt: '2026-05-02T09:30:00.000Z'
  },
  {
    id: 'asgn_021',
    orderId: 'ord_010',
    staffId: 'staff_004',
    date: '2026-06-20',
    role: 'makeup_artist',
    status: 'confirmed',
    remark: '',
    createdAt: '2026-05-02T09:30:00.000Z'
  },
  {
    id: 'asgn_022',
    orderId: 'ord_011',
    staffId: 'staff_001',
    date: '2026-06-25',
    role: 'chief_photographer',
    status: 'pending',
    remark: '档期待确认',
    createdAt: '2026-05-08T14:00:00.000Z'
  },
  {
    id: 'asgn_023',
    orderId: 'ord_011',
    staffId: 'staff_005',
    date: '2026-06-25',
    role: 'videographer',
    status: 'pending',
    remark: '',
    createdAt: '2026-05-08T14:00:00.000Z'
  },
  {
    id: 'asgn_024',
    orderId: 'ord_012',
    staffId: 'staff_001',
    date: '2026-06-09',
    role: 'chief_photographer',
    status: 'confirmed',
    remark: '海景拍摄',
    createdAt: '2026-05-10T10:00:00.000Z'
  },
  {
    id: 'asgn_025',
    orderId: 'ord_013',
    staffId: 'staff_001',
    date: '2026-06-22',
    role: 'chief_photographer',
    status: 'confirmed',
    remark: '',
    createdAt: '2026-05-12T11:00:00.000Z'
  },
  {
    id: 'asgn_026',
    orderId: 'ord_013',
    staffId: 'staff_003',
    date: '2026-06-22',
    role: 'assistant',
    status: 'confirmed',
    remark: '',
    createdAt: '2026-05-12T11:00:00.000Z'
  },
  {
    id: 'asgn_027',
    orderId: 'ord_014',
    staffId: 'staff_001',
    date: '2026-06-28',
    role: 'chief_photographer',
    status: 'pending',
    remark: '老客户复购',
    createdAt: '2026-05-15T09:00:00.000Z'
  },
  {
    id: 'asgn_028',
    orderId: 'ord_015',
    staffId: 'staff_001',
    date: '2026-06-11',
    role: 'chief_photographer',
    status: 'in_progress',
    remark: '今日拍摄',
    createdAt: '2026-04-20T10:00:00.000Z'
  },
  {
    id: 'asgn_029',
    orderId: 'ord_015',
    staffId: 'staff_003',
    date: '2026-06-11',
    role: 'assistant',
    status: 'in_progress',
    remark: '',
    createdAt: '2026-04-20T10:00:00.000Z'
  },
  {
    id: 'asgn_030',
    orderId: 'ord_015',
    staffId: 'staff_004',
    date: '2026-06-11',
    role: 'makeup_artist',
    status: 'in_progress',
    remark: '',
    createdAt: '2026-04-20T10:00:00.000Z'
  },
  {
    id: 'asgn_031',
    orderId: 'ord_015',
    staffId: 'staff_005',
    date: '2026-06-11',
    role: 'videographer',
    status: 'in_progress',
    remark: '',
    createdAt: '2026-04-20T10:00:00.000Z'
  }
]

export function initMockData() {
  return {
    customers: mockCustomers,
    packages: mockPackages,
    orders: mockOrders,
    costs: mockCosts,
    leads: mockLeads,
    staff: mockStaff,
    assignments: mockAssignments
  }
}
