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
    packageName: '经典套系',
    packagePrice: 8888,
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
    packageName: '豪华套系',
    packagePrice: 15888,
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
    packageName: '豪华套系',
    packagePrice: 15888,
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
    packageName: '尊享套系',
    packagePrice: 28888,
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
    packageName: '经典套系',
    packagePrice: 8888,
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
    packageName: '经典套系',
    packagePrice: 8888,
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
    packageName: '尊享套系',
    packagePrice: 28888,
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
    packageName: '豪华套系',
    packagePrice: 15888,
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
    packageName: '豪华套系',
    packagePrice: 15888,
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
    packageName: '经典套系',
    packagePrice: 8888,
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
    packageName: '尊享套系',
    packagePrice: 28888,
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
    packageName: '经典套系',
    packagePrice: 8888,
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
    packageName: '豪华套系',
    packagePrice: 15888,
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
    packageName: '经典套系',
    packagePrice: 8888,
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
    packageName: '尊享套系',
    packagePrice: 28888,
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

export const mockTravelShootProjects = [
  {
    id: 'ts_001',
    name: '三亚海景旅拍 - 张先生 & 李女士',
    orderId: 'ord_003',
    customerId: 'cust_001',
    destination: {
      id: 'sanya',
      name: '三亚',
      province: '海南',
      detailAddress: '三亚海棠湾、亚龙湾、天涯海角',
      latitude: 18.2528,
      longitude: 109.5120
    },
    status: 'confirmed',
    travelDates: {
      departDate: '2026-05-18',
      shootStartDate: '2026-05-19',
      shootEndDate: '2026-05-20',
      returnDate: '2026-05-21'
    },
    shootDays: 2,
    basePackageId: 'pkg_004',
    basePackagePrice: 36888,
    totalStaffCount: 4,
    transportBudget: 6000,
    accommodationBudget: 4000,
    extraCostBudget: 3000,
    totalBudget: 49888,
    remark: '客户指定海景+教堂+椰林三个场景',
    createdAt: '2026-02-01T10:00:00.000Z'
  },
  {
    id: 'ts_002',
    name: '大理风花雪月旅拍 - 王先生 & 陈小姐',
    orderId: 'ord_004',
    customerId: 'cust_002',
    destination: {
      id: 'dali',
      name: '大理',
      province: '云南',
      detailAddress: '洱海、双廊、喜洲古镇、苍山',
      latitude: 25.6068,
      longitude: 100.2679
    },
    status: 'planning',
    travelDates: {
      departDate: '2026-06-16',
      shootStartDate: '2026-06-17',
      shootEndDate: '2026-06-18',
      returnDate: '2026-06-19'
    },
    shootDays: 2,
    basePackageId: 'pkg_003',
    basePackagePrice: 28888,
    totalStaffCount: 4,
    transportBudget: 5000,
    accommodationBudget: 3500,
    extraCostBudget: 2500,
    totalBudget: 39888,
    remark: '客户要求拍摄日出和星空',
    createdAt: '2026-03-01T14:00:00.000Z'
  }
]

export const mockTravelShootTransports = [
  {
    id: 'tst_001',
    projectId: 'ts_001',
    type: 'flight',
    airline: '南方航空',
    flightNo: 'CZ3835',
    departFrom: '上海虹桥',
    arriveTo: '三亚凤凰',
    departDateTime: '2026-05-18 08:30',
    arriveDateTime: '2026-05-18 11:45',
    passengerCount: 4,
    costPerPerson: 1200,
    totalCost: 4800,
    isRoundTrip: true,
    bookingStatus: 'confirmed',
    remark: '陈伟、赵敏、王磊、刘洋 4人',
    createdAt: '2026-03-05T10:00:00.000Z'
  },
  {
    id: 'tst_002',
    projectId: 'ts_001',
    type: 'car_rental',
    company: '三亚海汽租车',
    carType: 'SUV',
    pickupDateTime: '2026-05-18 12:30',
    returnDateTime: '2026-05-21 14:00',
    totalCost: 1200,
    bookingStatus: 'confirmed',
    remark: '含保险，4天租期',
    createdAt: '2026-03-06T10:00:00.000Z'
  },
  {
    id: 'tst_003',
    projectId: 'ts_002',
    type: 'high_speed_rail',
    line: 'G403',
    departFrom: '北京西',
    arriveTo: '昆明南',
    departDateTime: '2026-06-16 07:05',
    arriveDateTime: '2026-06-16 17:14',
    passengerCount: 4,
    costPerPerson: 1147,
    totalCost: 4588,
    isRoundTrip: true,
    bookingStatus: 'pending',
    remark: '需在昆明转车到大理',
    createdAt: '2026-04-10T14:00:00.000Z'
  }
]

export const mockTravelShootAccommodations = [
  {
    id: 'tsa_001',
    projectId: 'ts_001',
    type: 'hotel_4star',
    hotelName: '三亚海棠湾喜来登度假酒店',
    address: '三亚海棠湾海棠北路8号',
    checkIn: '2026-05-18',
    checkOut: '2026-05-21',
    roomCount: 2,
    nights: 3,
    costPerRoomPerNight: 680,
    totalCost: 4080,
    bookingStatus: 'confirmed',
    contactName: '酒店前台',
    contactPhone: '0898-88888888',
    remark: '两间海景大床房，含早餐',
    createdAt: '2026-03-05T10:00:00.000Z'
  },
  {
    id: 'tsa_002',
    projectId: 'ts_002',
    type: 'hotel_boutique',
    hotelName: '大理双廊海景民宿',
    address: '大理市双廊镇大建旁村',
    checkIn: '2026-06-16',
    checkOut: '2026-06-19',
    roomCount: 2,
    nights: 3,
    costPerRoomPerNight: 580,
    totalCost: 3480,
    bookingStatus: 'pending',
    contactName: '民宿管家',
    contactPhone: '13912345678',
    remark: '洱海海景房，可拍日出',
    createdAt: '2026-04-10T14:00:00.000Z'
  }
]

export const mockTravelShootStaffAssignments = [
  {
    id: 'tss_001',
    projectId: 'ts_001',
    staffId: 'staff_001',
    role: 'chief_photographer',
    travelDays: 4,
    dailyAllowance: 300,
    mealAllowance: 80,
    transportAllowance: 50,
    totalAllowance: 1720,
    isTraveling: true,
    requiresAccommodation: true,
    remark: '主摄影师，负责全部拍摄',
    createdAt: '2026-03-01T10:00:00.000Z'
  },
  {
    id: 'tss_002',
    projectId: 'ts_001',
    staffId: 'staff_004',
    role: 'makeup_artist',
    travelDays: 4,
    dailyAllowance: 300,
    mealAllowance: 80,
    transportAllowance: 50,
    totalAllowance: 1720,
    isTraveling: true,
    requiresAccommodation: true,
    remark: '化妆师，全程跟妆',
    createdAt: '2026-03-01T10:00:00.000Z'
  },
  {
    id: 'tss_003',
    projectId: 'ts_001',
    staffId: 'staff_003',
    role: 'assistant',
    travelDays: 4,
    dailyAllowance: 200,
    mealAllowance: 60,
    transportAllowance: 40,
    totalAllowance: 1200,
    isTraveling: true,
    requiresAccommodation: true,
    remark: '摄影助理，灯光器材',
    createdAt: '2026-03-01T10:00:00.000Z'
  },
  {
    id: 'tss_004',
    projectId: 'ts_001',
    staffId: 'staff_005',
    role: 'videographer',
    travelDays: 4,
    dailyAllowance: 300,
    mealAllowance: 80,
    transportAllowance: 50,
    totalAllowance: 1720,
    isTraveling: true,
    requiresAccommodation: true,
    remark: '摄像师，微电影拍摄',
    createdAt: '2026-03-01T10:00:00.000Z'
  },
  {
    id: 'tss_005',
    projectId: 'ts_002',
    staffId: 'staff_001',
    role: 'chief_photographer',
    travelDays: 4,
    dailyAllowance: 300,
    mealAllowance: 80,
    transportAllowance: 50,
    totalAllowance: 1720,
    isTraveling: true,
    requiresAccommodation: true,
    remark: '主摄影师',
    createdAt: '2026-04-01T14:00:00.000Z'
  },
  {
    id: 'tss_006',
    projectId: 'ts_002',
    staffId: 'staff_004',
    role: 'makeup_artist',
    travelDays: 4,
    dailyAllowance: 300,
    mealAllowance: 80,
    transportAllowance: 50,
    totalAllowance: 1720,
    isTraveling: true,
    requiresAccommodation: true,
    remark: '化妆师',
    createdAt: '2026-04-01T14:00:00.000Z'
  },
  {
    id: 'tss_007',
    projectId: 'ts_002',
    staffId: 'staff_003',
    role: 'assistant',
    travelDays: 4,
    dailyAllowance: 200,
    mealAllowance: 60,
    transportAllowance: 40,
    totalAllowance: 1200,
    isTraveling: true,
    requiresAccommodation: true,
    remark: '摄影助理',
    createdAt: '2026-04-01T14:00:00.000Z'
  },
  {
    id: 'tss_008',
    projectId: 'ts_002',
    staffId: 'staff_005',
    role: 'videographer',
    travelDays: 4,
    dailyAllowance: 300,
    mealAllowance: 80,
    transportAllowance: 50,
    totalAllowance: 1720,
    isTraveling: true,
    requiresAccommodation: true,
    remark: '摄像师',
    createdAt: '2026-04-01T14:00:00.000Z'
  }
]

export const mockPaymentRecords = [
  {
    id: 'pay_001',
    orderId: 'ord_001',
    amount: 3000,
    payDate: '2025-12-20',
    paymentMethod: 'wechat',
    remark: '定金',
    createdAt: '2025-12-20T11:00:00.000Z'
  },
  {
    id: 'pay_002',
    orderId: 'ord_001',
    amount: 5888,
    payDate: '2026-03-05',
    paymentMethod: 'bank',
    remark: '尾款',
    createdAt: '2026-03-05T14:30:00.000Z'
  },
  {
    id: 'pay_003',
    orderId: 'ord_002',
    amount: 5000,
    payDate: '2026-01-20',
    paymentMethod: 'alipay',
    remark: '定金',
    createdAt: '2026-01-20T09:15:00.000Z'
  },
  {
    id: 'pay_004',
    orderId: 'ord_003',
    amount: 5000,
    payDate: '2026-01-15',
    paymentMethod: 'wechat',
    remark: '定金',
    createdAt: '2026-01-15T10:30:00.000Z'
  },
  {
    id: 'pay_005',
    orderId: 'ord_004',
    amount: 10000,
    payDate: '2026-02-01',
    paymentMethod: 'bank',
    remark: '定金',
    createdAt: '2026-02-01T14:20:00.000Z'
  },
  {
    id: 'pay_006',
    orderId: 'ord_006',
    amount: 3000,
    payDate: '2026-01-25',
    paymentMethod: 'cash',
    remark: '定金',
    createdAt: '2026-01-25T10:00:00.000Z'
  },
  {
    id: 'pay_007',
    orderId: 'ord_006',
    amount: 5888,
    payDate: '2026-02-25',
    paymentMethod: 'wechat',
    remark: '尾款结清',
    createdAt: '2026-02-25T16:00:00.000Z'
  },
  {
    id: 'pay_008',
    orderId: 'ord_007',
    amount: 10000,
    payDate: '2026-03-01',
    paymentMethod: 'alipay',
    remark: '定金',
    createdAt: '2026-03-01T09:00:00.000Z'
  },
  {
    id: 'pay_009',
    orderId: 'ord_008',
    amount: 5000,
    payDate: '2026-04-10',
    paymentMethod: 'wechat',
    remark: '定金',
    createdAt: '2026-04-10T10:00:00.000Z'
  },
  {
    id: 'pay_010',
    orderId: 'ord_009',
    amount: 5000,
    payDate: '2026-04-15',
    paymentMethod: 'bank',
    remark: '定金',
    createdAt: '2026-04-15T11:00:00.000Z'
  },
  {
    id: 'pay_011',
    orderId: 'ord_009',
    amount: 5888,
    payDate: '2026-06-05',
    paymentMethod: 'wechat',
    remark: '尾款',
    createdAt: '2026-06-05T15:30:00.000Z'
  },
  {
    id: 'pay_012',
    orderId: 'ord_010',
    amount: 3000,
    payDate: '2026-05-02',
    paymentMethod: 'alipay',
    remark: '定金',
    createdAt: '2026-05-02T09:30:00.000Z'
  },
  {
    id: 'pay_013',
    orderId: 'ord_010',
    amount: 5888,
    payDate: '2026-06-10',
    paymentMethod: 'bank',
    remark: '尾款，老客户优惠免去888元零头',
    createdAt: '2026-06-10T10:00:00.000Z'
  },
  {
    id: 'pay_014',
    orderId: 'ord_011',
    amount: 10000,
    payDate: '2026-05-08',
    paymentMethod: 'wechat',
    remark: '定金',
    createdAt: '2026-05-08T14:00:00.000Z'
  },
  {
    id: 'pay_015',
    orderId: 'ord_012',
    amount: 3000,
    payDate: '2026-05-10',
    paymentMethod: 'cash',
    remark: '定金',
    createdAt: '2026-05-10T10:00:00.000Z'
  },
  {
    id: 'pay_016',
    orderId: 'ord_013',
    amount: 5000,
    payDate: '2026-05-12',
    paymentMethod: 'alipay',
    remark: '定金',
    createdAt: '2026-05-12T11:00:00.000Z'
  },
  {
    id: 'pay_017',
    orderId: 'ord_014',
    amount: 3000,
    payDate: '2026-05-15',
    paymentMethod: 'wechat',
    remark: '定金',
    createdAt: '2026-05-15T09:00:00.000Z'
  },
  {
    id: 'pay_018',
    orderId: 'ord_015',
    amount: 10000,
    payDate: '2026-04-20',
    paymentMethod: 'bank',
    remark: '定金',
    createdAt: '2026-04-20T10:00:00.000Z'
  },
  {
    id: 'pay_019',
    orderId: 'ord_015',
    amount: 18888,
    payDate: '2026-06-05',
    paymentMethod: 'wechat',
    remark: '高端定制，尾款一次性付清',
    createdAt: '2026-06-05T14:00:00.000Z'
  }
]

export const mockTravelShootExtraCosts = [
  {
    id: 'tsec_001',
    projectId: 'ts_001',
    category: 'venue_fee',
    name: '海棠湾私人沙滩场地费',
    date: '2026-05-19',
    amount: 800,
    paymentStatus: 'paid',
    remark: '2小时私人沙滩拍摄许可',
    createdAt: '2026-04-20T10:00:00.000Z'
  },
  {
    id: 'tsec_002',
    projectId: 'ts_001',
    category: 'props',
    name: '婚礼道具购买',
    date: '2026-05-10',
    amount: 600,
    paymentStatus: 'paid',
    remark: '鲜花拱门、纱幔、气球等',
    createdAt: '2026-04-25T10:00:00.000Z'
  },
  {
    id: 'tsec_003',
    projectId: 'ts_001',
    category: 'food',
    name: '拍摄期间工作餐',
    date: '2026-05-20',
    amount: 480,
    paymentStatus: 'paid',
    remark: '4人2天8餐',
    createdAt: '2026-05-22T10:00:00.000Z'
  },
  {
    id: 'tsec_004',
    projectId: 'ts_001',
    category: 'insurance',
    name: '人员及器材保险',
    date: '2026-05-15',
    amount: 320,
    paymentStatus: 'paid',
    remark: '4人意外险 + 器材险，共5天',
    createdAt: '2026-04-28T10:00:00.000Z'
  },
  {
    id: 'tsec_005',
    projectId: 'ts_002',
    category: 'permit_fee',
    name: '洱海湿地公园拍摄许可',
    date: '2026-06-15',
    amount: 500,
    paymentStatus: 'pending',
    remark: '3天拍摄许可费',
    createdAt: '2026-05-01T14:00:00.000Z'
  },
  {
    id: 'tsec_006',
    projectId: 'ts_002',
    category: 'packing_transport',
    name: '摄影器材托运',
    date: '2026-06-10',
    amount: 680,
    paymentStatus: 'pending',
    remark: '器材物流托运往返',
    createdAt: '2026-05-10T14:00:00.000Z'
  }
]

export const mockCommunications = [
  {
    id: 'comm_001',
    customerId: 'cust_001',
    category: 'follow_up',
    type: 'wechat',
    nodeType: 'initial_contact',
    title: '官网首次咨询',
    content: '客户通过官网填写咨询表单，婚期定在5月20日，酒店在华尔道夫，初步了解我们的套餐情况。',
    summary: '首次触达，客户对豪华套系表现出兴趣',
    operator: '销售A',
    communicationTime: '2026-01-10T10:00:00.000Z',
    nextFollowUpTime: '2026-01-12T10:00:00.000Z',
    priority: 'high',
    createdAt: '2026-01-10T10:15:00.000Z',
    updatedAt: '2026-01-10T10:15:00.000Z'
  },
  {
    id: 'comm_002',
    customerId: 'cust_001',
    category: 'follow_up',
    type: 'phone',
    nodeType: 'demand_confirm',
    title: '电话需求确认',
    content: '电话沟通确认细节：新人喜欢自然清新风格，外景想拍外滩和豫园，预算约1.5万，希望有微电影。',
    summary: '确认需求：清新风格+外滩外景+微电影',
    operator: '销售A',
    communicationTime: '2026-01-12T10:30:00.000Z',
    nextFollowUpTime: '2026-01-14T14:00:00.000Z',
    priority: 'high',
    createdAt: '2026-01-12T11:00:00.000Z',
    updatedAt: '2026-01-12T11:00:00.000Z'
  },
  {
    id: 'comm_003',
    customerId: 'cust_001',
    category: 'note',
    noteCategory: 'preference',
    title: '风格偏好记录',
    content: '重点偏好：1. 外景：外滩夜景必拍，豫园中式元素；2. 色调：柔和暖调；3. 不喜欢过度摆拍，以纪实抓拍为主；4. 新娘：韩式简约妆容；新郎：黑色西装+领结。',
    operator: '销售A',
    createdAt: '2026-01-12T14:20:00.000Z',
    updatedAt: '2026-01-12T14:20:00.000Z'
  },
  {
    id: 'comm_004',
    customerId: 'cust_001',
    category: 'follow_up',
    type: 'meeting',
    nodeType: 'contract_sign',
    title: '到店面谈签单',
    content: '客户到店参观，看了客片作品集后非常满意。确定豪华套系(15888)，加拍1套内景，加10张精修，总价18888。付定金5000元。',
    summary: '签订合同，豪华套系+内景加拍',
    operator: '销售A',
    communicationTime: '2026-01-15T10:00:00.000Z',
    nextFollowUpTime: '2026-04-20T10:00:00.000Z',
    priority: 'medium',
    createdAt: '2026-01-15T12:00:00.000Z',
    updatedAt: '2026-01-15T12:00:00.000Z'
  },
  {
    id: 'comm_005',
    customerId: 'cust_002',
    category: 'follow_up',
    type: 'wechat',
    nodeType: 'quotation',
    title: '微信发送报价',
    content: '小红书来的客户，对尊享套系感兴趣。通过微信发送尊享套系报价单28888，包含创始人摄影师+200张精修+2分钟微电影。',
    summary: '已发送尊享套系报价',
    operator: '销售B',
    communicationTime: '2026-01-28T11:00:00.000Z',
    nextFollowUpTime: '2026-01-30T15:00:00.000Z',
    priority: 'high',
    createdAt: '2026-01-28T11:30:00.000Z',
    updatedAt: '2026-01-28T11:30:00.000Z'
  },
  {
    id: 'comm_006',
    customerId: 'cust_002',
    category: 'note',
    noteCategory: 'budget',
    title: '预算信息',
    content: '客户预算约3万，可接受浮动。倾向尊享套系(28888)，如能包含48h抢先看+婚前MV，愿意立即签约。',
    operator: '销售B',
    createdAt: '2026-01-28T15:20:00.000Z',
    updatedAt: '2026-01-28T15:20:00.000Z'
  },
  {
    id: 'comm_007',
    customerId: 'cust_002',
    category: 'transfer',
    transferFrom: '销售B',
    transferTo: '销售总监',
    transferReason: '客户希望升级为尊享定制服务，需要总监级别的沟通与协调档期',
    handlerNote: '',
    transferStatus: 'completed',
    priority: 'high',
    operator: '销售B',
    createdAt: '2026-01-30T10:00:00.000Z',
    updatedAt: '2026-01-30T16:00:00.000Z',
    statusLogs: [
      {
        id: 'log_001',
        fromStatus: 'pending',
        toStatus: 'processing',
        handlerNote: '已收到转单，安排下午沟通',
        operatedAt: '2026-01-30T11:00:00.000Z'
      },
      {
        id: 'log_002',
        fromStatus: 'processing',
        toStatus: 'completed',
        handlerNote: '已与客户完成电话沟通，需求已明确',
        operatedAt: '2026-01-30T16:00:00.000Z'
      }
    ]
  },
  {
    id: 'comm_008',
    customerId: 'cust_003',
    category: 'follow_up',
    type: 'phone',
    nodeType: 'negotiation',
    title: '价格谈判电话',
    content: '大众点评客户，对豪华套系报价15888表示略超预算，希望能到14000。沟通后方案：保持价格不变，赠送30张精修+精美摆台一个，客户表示接受。',
    summary: '价格谈判：赠送服务替代降价',
    operator: '销售A',
    communicationTime: '2026-01-18T15:00:00.000Z',
    nextFollowUpTime: '2026-01-20T09:00:00.000Z',
    priority: 'medium',
    createdAt: '2026-01-18T16:30:00.000Z',
    updatedAt: '2026-01-18T16:30:00.000Z'
  },
  {
    id: 'comm_009',
    customerId: 'cust_003',
    category: 'note',
    noteCategory: 'important',
    title: '重要事项备忘',
    content: '【重要】客户要求：1. 中式秀禾服造型必须有，已确认化妆师赵敏擅长此风格；2. 双方父母需到场拍摄全家福；3. 婚礼当天8点前必须到酒店。',
    operator: '销售A',
    createdAt: '2026-01-20T10:30:00.000Z',
    updatedAt: '2026-01-20T10:30:00.000Z'
  },
  {
    id: 'comm_010',
    customerId: 'cust_005',
    category: 'follow_up',
    type: 'meeting',
    nodeType: 'referral',
    title: '老客户转介绍',
    content: '老客户李女士推荐的黄先生&吴女士，初次面谈就非常信任。已确定经典套系8888，付定金3000元。李女士将获得转介绍红包888元。',
    summary: '老客户转介绍成功，经典套系签约',
    operator: '销售A',
    communicationTime: '2025-12-20T11:00:00.000Z',
    nextFollowUpTime: '2026-02-25T10:00:00.000Z',
    priority: 'low',
    createdAt: '2025-12-20T11:30:00.000Z',
    updatedAt: '2025-12-20T11:30:00.000Z'
  },
  {
    id: 'comm_011',
    customerId: 'cust_004',
    category: 'follow_up',
    type: 'video',
    nodeType: 'pre_wedding',
    title: '婚前视频会议',
    content: '视频会议沟通拍摄细节：海景拍摄时间安排、下午户外仪式流程、亲友团合影时间。已确认摄影师陈伟+化妆师赵敏档期。',
    summary: '婚前细节沟通完毕，人员档期确认',
    operator: '销售B',
    communicationTime: '2026-06-05T14:00:00.000Z',
    nextFollowUpTime: '2026-07-08T09:00:00.000Z',
    priority: 'high',
    createdAt: '2026-06-05T15:30:00.000Z',
    updatedAt: '2026-06-05T15:30:00.000Z'
  },
  {
    id: 'comm_012',
    customerId: 'cust_004',
    category: 'transfer',
    transferFrom: '销售B',
    transferTo: '摄影师陈伟',
    transferReason: '客户海景拍摄有特殊需求，需要和摄影师直接沟通拍摄方案',
    handlerNote: '客户希望拍日落剪影和无人机航拍',
    transferStatus: 'processing',
    priority: 'medium',
    operator: '销售B',
    createdAt: '2026-06-08T10:00:00.000Z',
    updatedAt: '2026-06-08T14:30:00.000Z',
    statusLogs: [
      {
        id: 'log_003',
        fromStatus: 'pending',
        toStatus: 'processing',
        handlerNote: '摄影师已预约6月10日电话沟通',
        operatedAt: '2026-06-08T14:30:00.000Z'
      }
    ]
  },
  {
    id: 'comm_013',
    customerId: 'cust_001',
    category: 'follow_up',
    type: 'wechat',
    nodeType: 'select_photos',
    title: '选片沟通',
    content: '客户已完成在线选片，共选出130张精修（套系100张+加选30张），加选费用3000元已通过微信转账。特别标注：第42、78、115张需做相册跨页。',
    summary: '选片完成，加选30张精修',
    operator: '选片师小周',
    communicationTime: '2026-05-25T10:00:00.000Z',
    nextFollowUpTime: '2026-06-05T10:00:00.000Z',
    priority: 'medium',
    createdAt: '2026-05-25T16:00:00.000Z',
    updatedAt: '2026-05-25T16:00:00.000Z'
  },
  {
    id: 'comm_014',
    customerId: 'cust_005',
    category: 'follow_up',
    type: 'sms',
    nodeType: 'after_sales',
    title: '售后回访短信',
    content: '发送短信回访："黄先生您好，感谢选择我们！您的相册已顺丰寄出(单号SF123456789)，预计3天内送达。如有任何问题欢迎随时联系我们，祝您生活愉快～"',
    summary: '产品交付，售后回访完成',
    operator: '客服小郑',
    communicationTime: '2026-03-20T09:30:00.000Z',
    nextFollowUpTime: null,
    priority: 'low',
    createdAt: '2026-03-20T09:30:00.000Z',
    updatedAt: '2026-03-20T09:30:00.000Z'
  },
  {
    id: 'comm_015',
    customerId: 'cust_002',
    category: 'note',
    noteCategory: 'family',
    title: '家庭成员信息',
    content: '新娘父亲：王总，北京某企业高管，婚礼当天会致辞；新娘母亲：喜欢拍照，要求多拍特写；新郎父母：从成都过来，要求安排接机；伴郎伴娘：各4人，伴郎团中有新娘弟弟。',
    operator: '销售总监',
    createdAt: '2026-02-01T15:20:00.000Z',
    updatedAt: '2026-02-01T15:20:00.000Z'
  },
  {
    id: 'comm_016',
    customerId: 'cust_005',
    category: 'transfer',
    transferFrom: '销售A',
    transferTo: '精修部',
    transferReason: '客户对部分精修照片不满意，需要转精修部重新处理',
    handlerNote: '共8张需重修：色调偏冷、脸型微修、背景杂物',
    transferStatus: 'pending',
    priority: 'high',
    operator: '销售A',
    createdAt: '2026-06-11T10:00:00.000Z',
    updatedAt: '2026-06-11T10:00:00.000Z',
    statusLogs: []
  },
  {
    id: 'comm_017',
    customerId: 'cust_003',
    category: 'follow_up',
    type: 'phone',
    nodeType: 'retouch_feedback',
    title: '精修反馈电话',
    content: '电话回访精修意见：客户对第一版精修整体满意，提出3点修改意见：1. 第23张背景路人修掉；2. 第56张新娘手臂修细一点；3. 第89张色调调亮。预计3天内完成修改。',
    summary: '精修反馈收集完成，3处待修改',
    operator: '客服小郑',
    communicationTime: '2026-05-10T11:00:00.000Z',
    nextFollowUpTime: '2026-05-13T14:00:00.000Z',
    priority: 'medium',
    createdAt: '2026-05-10T12:00:00.000Z',
    updatedAt: '2026-05-10T12:00:00.000Z'
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
    assignments: mockAssignments,
    travelShootProjects: mockTravelShootProjects,
    travelShootTransports: mockTravelShootTransports,
    travelShootAccommodations: mockTravelShootAccommodations,
    travelShootStaffAssignments: mockTravelShootStaffAssignments,
    travelShootExtraCosts: mockTravelShootExtraCosts,
    paymentRecords: mockPaymentRecords,
    communications: mockCommunications
  }
}
