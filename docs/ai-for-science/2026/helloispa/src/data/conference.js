(function attachConferenceData(root) {
  const conference = {
    meta: {
      shortName: 'IEEE ISPA 2026',
      edition: '24th',
      fullName: 'The 24th IEEE International Symposium on Parallel and Distributed Processing with Applications',
      city: 'Kuala Lumpur',
      country: 'Malaysia',
      dateLong: '27–30 December 2026',
      dateShort: '27–30 DECEMBER 2026',
      since: '2003',
      edasUrl: 'https://edas.info/N35627',
      officialUrl: '../ispa/',
      introduction:
        'ISPA 2026 is an international forum for original research on parallel, distributed, edge, cloud and large-scale computing systems. The conference welcomes innovations spanning heterogeneous systems, P2P networks, AI computing architecture, blockchain security, big data analytics and pervasive services.',
    },
    deadlines: [
      { dateLabel: '15 AUG 2026', title: 'Workshop Proposal Due', tone: 'standard' },
      { dateLabel: '30 SEP 2026', title: 'Regular Paper Due', tone: 'primary' },
      { dateLabel: '30 OCT 2026', title: 'Author Notification Due', tone: 'standard' },
      { dateLabel: '30 NOV 2026', title: 'Paper Registration Due', tone: 'standard' },
      { dateLabel: '30 NOV 2026', title: 'Camera-ready Submission Due', tone: 'standard' },
      { dateLabel: '27–30 DEC 2026', title: 'Conference Dates', tone: 'conference' },
    ],
    tracks: [
      {
        number: '01',
        title: 'Systems & Architectures',
        summary: 'Infrastructure, architectures and distributed systems that make large-scale computing possible.',
        topics: [
          'Cloud computing and data center technology',
          'Migration of computations',
          'Multi-clouds environments, cloud federation, interoperability',
          'Energy management and green computing',
          'Wireless and mobile networks',
          'Systems and Architectures for artificial intelligence',
          'Distributed/parallel algorithms and application',
          'Social networks, crowdsourcing, and P2P systems',
          'Distributed file and storage systems, I/O systems',
        ],
      },
      {
        number: '02',
        title: 'Technologies & Tools',
        summary: 'Programming paradigms, compilers, middleware and system tools for modern parallel and distributed platforms.',
        topics: [
          'Parallel and distributed computing paradigms',
          'Novel parallel programming paradigms',
          'Programming models for cloud services',
          'Code generation and optimization',
          'Compilers for parallel computers',
          'Middleware and tools',
          'Scheduling and resource management',
          'Reliability, fault tolerance, and dependability',
          'Generative AI, agents, and world model',
        ],
      },
      {
        number: '03',
        title: 'Applications & Services',
        summary: 'Scientific, pervasive, data-intensive and AI-enabled services built on scalable computing foundations.',
        topics: [
          'High-performance scientific and engineering computing',
          'Grid and cluster computing',
          'Pervasive and ubiquitous computing',
          'Databases, data mining, and data management',
          'Big data and business analytics',
          'Scientific cloud systems and services',
          'Internet computing and web services',
          'Software defined network and its applications',
          'LLMs powered by parallel and distributed computing',
        ],
      },
      {
        number: '04',
        title: 'Security & Block-chain',
        summary: 'Security, privacy, federated intelligence and blockchain systems across cloud, edge and cyber-physical environments.',
        topics: [
          'Security in parallel AI systems',
          'Federated learning',
          'Blockchain-based applications and services',
          'Blockchain security and privacy',
          'Blockchain in cyber physical systems',
          'Scalability issues in blockchain',
          'Blockchain in edge and cloud computing',
          'Blockchain-based applications and services',
          'Decentralized blockchain-enabled AI systems',
        ],
      },
    ],
    chairGroups: [
      {
        label: 'General Chairs',
        members: [
          { name: 'Geyong Min', institution: 'University of Exeter', country: 'UK', photo: 'assets/chairs/geyong-min.jpg' },
          { name: 'Nong Xiao', institution: 'Sun Yat-sen University', country: 'China', photo: 'assets/chairs/nong-xiao.jpg' },
        ],
      },
      {
        label: 'Program Chairs',
        members: [
          { name: 'Huazhong Liu', institution: 'Zhejiang Normal University', country: 'China', photo: 'assets/chairs/huazhongLiu.png' },
          { name: 'Rong Gu', institution: 'Nanjing University', country: 'China', photo: 'assets/chairs/rong-gu.png' },
        ],
      },
      {
        label: 'Program Vice-Chairs',
        members: [
          { name: 'Jiawei Huang', institution: 'Central South University', country: 'China', photo: 'assets/chairs/jiawei-huang.jpg' },
          { name: 'Chubo Liu', institution: 'Hunan University', country: 'China', photo: 'assets/chairs/chubo-liu.png' },
          { name: 'Minchen Yu', institution: 'The Chinese University of Hong Kong, Shenzhen', country: 'China', photo: 'assets/chairs/minchen-yu.jpg' },
        ],
      },
      {
        label: 'Local Chairs',
        members: [
          { name: 'Azreen Azman', institution: 'Universiti Putra Malaysia', country: 'Malaysia', photo: 'assets/chairs/azreen-azman.jpg' },
          { name: 'Xiangli Yang', institution: 'Zhengzhou University', country: 'China', photo: 'assets/chairs/xiangli-yang.gif' },
        ],
      },
      {
        label: 'Workshop / Special Session Chairs',
        members: [
          { name: 'Shaojun Zou', institution: 'Hainan University', country: 'China', photo: 'assets/chairs/shaojun-zou.jpg' },
          { name: 'Zhou Zhou', institution: 'Changsha University', country: 'China', photo: 'assets/chairs/zhou-zhou.jpg' },
        ],
      },
      {
        label: 'Publicity Chairs',
        members: [
          { name: 'Yangbo Jiang', institution: 'Zhejiang University of Finance & Economics', country: 'China', photo: 'assets/chairs/yangbo-jiang.png' },
          { name: 'Xun Shao', institution: 'Toyohashi University of Technology', country: 'Japan', photo: 'assets/chairs/xun-shao.jpeg' },
          { name: 'Tingting Han', institution: 'Hainan University', country: 'China', photo: '' },
        ],
      },
      {
        label: 'Publication Chairs',
        members: [
          { name: 'Zhicai Zhang', institution: 'Hainan University', country: 'China', photo: 'assets/chairs/zhicai-zhang.jpg' },
          { name: 'Binbin Zhou', institution: 'Hangzhou City University', country: 'China', photo: 'assets/chairs/binbin-zhou.png' },
          { name: 'Wenxuan Zhang', institution: 'Hainan University', country: 'China', photo: '' },
        ],
      },
      {
        label: 'Web Chairs',
        members: [
          { name: 'Ren Li', institution: 'Hainan University', country: 'China', photo: 'assets/chairs/ren-li.png' },
          { name: 'Yongqin Zhang', institution: 'Hainan University', country: 'China', photo: 'assets/chairs/yongqin-zhang.png' },
        ],
      },
      {
        label: 'Steering Committee',
        members: [
          { name: 'Minyi Guo', institution: 'Shanghai Jiao Tong University', country: 'China', photo: 'assets/chairs/minyi-guo.jpg' },
          { name: 'Laurence T. Yang', institution: 'Zhengzhou University', country: 'China', photo: 'assets/chairs/Laurence T. Yang.png' },
          { name: 'Liang Zhao', institution: 'Shenyang Aerospace University', country: 'China', photo: 'assets/chairs/liang-zhao.jpg' },
        ],
      },
    ],
    submission: {
      pageAllowance: '8+2 or 6+2',
      maximumPages: 10,
      review: 'Single-blind',
      publication: [
        'All accepted papers will be submitted to IEEE Xplore and EI.',
        'Distinguished papers presented at the conference, after further revision, will be invited for submission to a special issue.',
      ],
    },
    publication: [
      { label: 'IEEE Computer Society Press', detail: 'Proceedings publisher' },
      { label: 'IEEE Xplore', detail: 'Accepted papers submitted for inclusion' },
      { label: 'EI', detail: 'Accepted papers submitted for indexing' },
    ],
    specialIssues: [
      {
        journal: 'IEEE Transactions on Computational Social Systems',
        title: 'Cyber-Physical Intelligence: State-of-the-art, Perspectives, and Challenges',
        url: 'https://www.ieeesmc.org/wp-content/uploads/2026/01/CFP_SI-on-Cyber-Physical-Social-Intelligence.pdf',
      },
      {
        journal: 'Journal of Systems Architecture',
        title: 'Security and Efficiency for LLM-Based Edge Intelligence',
        url: 'https://www.sciencedirect.com/special-issue/328321/security-and-efficiency-for-llm-based-edge-intelligence',
      },
      {
        journal: 'Big Data Mining and Analytics',
        title: 'High Performance Computing and Communications for Cyber-Physical-Social Big Data Mining and Analytics',
        url: 'https://www.sciopen.com/journal/message_news/get_by_id?id=2069618442316066818&issn=2096-0654',
      },
      {
        journal: 'Computer Standards & Interfaces',
        title: 'Security and Resilience of AI Agents in Digital Critical Infrastructures',
        url: 'https://www.sciencedirect.com/special-issue/335299/security-and-resilience-of-ai-agents-in-digital-critical-infrastructures',
      },
    ],
    congress: ['ISPA', 'BDCloud', 'SocialCom', 'SustainCom', 'SpaCCS'],
    sponsors: [
      { name: 'IEEE', logo: 'assets/logos/ieee.png' },
      { name: 'IEEE Computer Society', logo: 'assets/logos/ieee-computer-society.png' },
      { name: 'IEEE TCSC', logo: 'assets/logos/ieee-tcsc.png' },
      { name: 'IEEE HI-TC', logo: 'assets/logos/ieee-hi-tc.jpg' },
      { name: 'IEEE SMC TC on CyberMatics', logo: 'assets/logos/ieee-smc-tc-cybermatics.png' },
      { name: 'CPSS', logo: 'assets/logos/cpss.png' },
    ],
    organizers: [
      { name: 'Zhengzhou University', logo: 'assets/logos/zhengzhou-university.png' },
      { name: 'Zhejiang Normal University', logo: 'assets/logos/zhejiang-normal-university.jpg' },
    ],
  };

  root.CONFERENCE_DATA = conference;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = conference;
  }
})(typeof window !== 'undefined' ? window : globalThis);
