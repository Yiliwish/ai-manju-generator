import type { Project } from '../types'

/**
 * 示例项目：《细雨即将来临》（雷·布拉德伯里）
 * 选它做演示，因为全片只在「一栋房子」里发生 —— 同一空间跨多个镜头，
 * 恰好最能说明「场景母本锁构图」治空间漂移的价值。
 *
 * 图片字段使用本地示例素材；进入对应步骤后可用已配置的模型重新生成。
 */
export const exampleProject: Project = {
  id: 'xishu',
  title: '细雨即将来临',
  source: '雷·布拉德伯里《细雨即将来临》（公有领域）',
  style: '末世番剧 · 暗调 · 8 镜竖屏',
  aspect: '9:16',
  originalExcerpt:
    '俄耳浦斯冲破地府的重重阻碍，来到冥王和冥后的王座面前。冥王和冥后看见一个活人站在自己面前，大吃一惊。俄耳浦斯轻荡琴弦，弦间流淌出如泣如诉的音乐之声。唱到：“下界之王啊，我历尽千难万险，才来到你的面前，请你让她回到我的身边。若非如此，我宁可死去，也不愿独自活在人间！”',

  characters: [
    {
      id: 'mouse',
      name: '清洁鼠',
      role: '机器实体（反复出场）',
      image: 'images/char-mouse.png',
      identity:
        '银灰色金属圆壳小鼠，浅红色电子眼，铜屑般的光泽外壳，钢制颚骨，从墙洞进出的清扫机器人',
      states: [
        { shot: 3, note: '钻出墙洞，触须转动揉毛团' },
        { shot: 7, note: '运水救火，浅红电子眼熄灭' },
      ],
    },
    {
      id: 'dog',
      name: '狗',
      role: '垂死的流浪动物',
      image: 'images/char-dog.png',
      identity: '骨瘦如柴的棕褐色大狗，皮包骨头，口吐白沫，眼冒火光',
      states: [{ shot: 4, note: '门廊打战、转圈，最终倒地' }],
    },
  ],

  scenes: [
    {
      id: 'exterior',
      name: '房子外景',
      masterPlate: 'images/scene-exterior.png',
      geometry: '孤零零的二层白漆洋房，西墙几乎焚毁，屋顶有水泵，前门有门廊，雨中',
      shots: [1],
    },
    {
      id: 'kitchen',
      name: '厨房',
      masterPlate: 'images/scene-kitchen.png',
      geometry: '暖色调厨房，炉子靠墙，天花板的语音孔，金属通道的下水口，油地毡地面',
      shots: [2, 7],
    },
    {
      id: 'livingroom',
      name: '起居室',
      masterPlate: 'images/scene-livingroom.png',
      geometry: '宽敞起居室，壁炉在侧，长桌从天井墙内伸出，橡木椅，玻璃育儿室墙在远端',
      shots: [3],
    },
    {
      id: 'yard',
      name: '院子',
      geometry: '雨后院子，洒水管旋出地面，烧焦的西墙上印着五个人的剪影',
      shots: [4],
    },
    {
      id: 'nursery',
      name: '育儿室',
      geometry: '玻璃墙育儿室，地毯织成葱郁草地，隐藏的胶片齿轮，墙上闪烁动物影像',
      shots: [5],
    },
    {
      id: 'study',
      name: '书房',
      geometry: '书房，壁炉火焰摇曳，金属立橱伸出一支半英寸灰烬的雪茄，天花板有语音孔',
      shots: [6],
    },
    {
      id: 'ruins',
      name: '废墟',
      geometry: '黎明时分的废墟，浓烟，只剩一面墙孤独立着',
      shots: [8],
    },
  ],

  shots: [
    {
      id: 1,
      sceneId: 'exterior',
      image: 'images/shot-01.png',
      characters: [],
      duration: 5,
      type: '空镜',
      text: '（旁白）今天是 2026 年 8 月 4 日，加利福尼亚的阿利达尔市。',
      camera: '远景固定机位，雨丝划过画面，推近房前',
      plateWeight: 55,
      motion: '雨丝动效 + 缓慢推近',
    },
    {
      id: 2,
      sceneId: 'kitchen',
      characters: [],
      duration: 6,
      type: '旁白',
      text: '厨房里，炉子咝咝地响了一下，从温暖的炉箱里推出一套早饭。',
      camera: '中景，炉子前景，热气升起',
      plateWeight: 65,
      motion: '蒸汽升腾动效',
    },
    {
      id: 3,
      sceneId: 'livingroom',
      image: 'images/shot-03.png',
      characters: ['mouse'],
      duration: 7,
      type: '旁白',
      text: '闹钟唱道：“大扫除。”许多机器小鼠从墙洞里钻出来，把屋子打扫得焕然一新。',
      camera: '中近景，小鼠贴地移动，浅红电子眼',
      plateWeight: 60,
      motion: '小鼠爬行 + 电子眼闪烁',
    },
    {
      id: 4,
      sceneId: 'yard',
      characters: ['dog'],
      duration: 6,
      type: '旁白',
      text: '烧焦的西墙上，印着五个人的剪影——男人、妇女、孩子，还有一只永远落不下的球。',
      camera: '中景，狗在门廊打战，墙上的剪影逐渐清晰',
      plateWeight: 70,
      motion: '剪影淡入',
    },
    {
      id: 5,
      sceneId: 'nursery',
      characters: [],
      duration: 6,
      type: '旁白',
      text: '育儿室的墙渐渐亮起来：黄色的长颈鹿、蓝色的狮子在透明的墙上游动。这是孩子们的时间。',
      camera: '全景，动物影像在玻璃墙上亮起',
      plateWeight: 60,
      motion: '动物影像流动',
    },
    {
      id: 6,
      sceneId: 'study',
      characters: [],
      duration: 8,
      type: '对白',
      text: '“细雨即将来临，大地的气息，闪烁出声响，伴着雨燕翱翔……”天花板温柔地朗诵着。',
      camera: '近景，壁炉火焰，雪茄已成灰，镜头缓升向天花板',
      plateWeight: 65,
      motion: '火焰摇曳 + 镜头缓升',
    },
    {
      id: 7,
      sceneId: 'kitchen',
      image: 'images/shot-07.png',
      characters: ['mouse'],
      duration: 7,
      type: '动作',
      text: '树枝冲进厨房的窗子，碰碎清洁剂，溅出的液体遇到火立刻燃着了。小鼠们忙着运水救火。',
      camera: '中景，火从窗入，小鼠成群运水',
      plateWeight: 70,
      motion: '火焰蔓延 + 小鼠奔走',
    },
    {
      id: 8,
      sceneId: 'ruins',
      characters: [],
      duration: 6,
      type: '旁白',
      text: '黎明将至。废墟里，只有一面墙站立着，一遍又一遍地说：“今天是 2026 年 8 月 5 日。”',
      camera: '远景，晨光洒在废墟与冉冉水蒸气上',
      plateWeight: 55,
      motion: '晨光渐亮',
    },
  ],
}
