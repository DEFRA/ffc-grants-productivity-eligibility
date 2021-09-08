const desirabilityQuestions = ['projectSubject', 'dataAnalytics', 'energySource', 'agriculturalSector', 'roboticProjectImpacts']

const mockQuestionContent = {
  projectSubject: [
    {
      key: 'projectSubject',
      title: 'projectSubject title',
      answers: {
        'projectSubject-A1': 'projectSubject answer 1',
        'projectSubject-A2': 'projectSubject answer 2'
      }
    }
  ],
  projectImpacts: [
    {
      key: 'projectImpacts',
      title: 'projectImpacts title',
      answers: {
        'projectImpacts-A1': 'projectImpacts answer'
      }
    }
  ],
  dataAnalytics: [
    {
      key: 'dataAnalytics',
      title: 'dataAnalytics title',
      answers: {
        'dataAnalytics-A1': 'dataAnalytics answer',
        'dataAnalytics-A2': 'dataAnalytics answer'
      }
    }
  ],
  energySource: [
    {
      key: 'energySource',
      title: 'energySource title',
      answers: {
        'energySource-A1': 'energySource answer',
        'energySourceb-A1': 'energySourceb answer'
      }
    }
  ],
  agriculturalSector: [
    {
      key: 'agriculturalSector',
      title: 'agriculturalSector title',
      answers: {
        'agriculturalSector-A1': 'agriculturalSector answer 1',
        'agriculturalSector-A2': 'agriculturalSector answer 2'
      }
    }
  ],
  roboticProjectImpacts: [
    {
      key: 'roboticProjectImpacts',
      title: 'roboticProjectImpacts title',
      answers: {
        'roboticProjectImpacts-A1': 'roboticProjectImpacts answer 1',
        'roboticProjectImpacts-A2': 'roboticProjectImpacts answer 2'
      }
    }]
}
const mockUserInput = {
  projectSubject: 'projectSubject-A1',
  dataAnalytics: 'dataAnalytics-A1',
  energySource: ['energySource-A1', 'energySource-A2'],
  agriculturalSector: ['agriculturalSector-A1', 'agriculturalSector-A2'],
  roboticProjectImpacts: 'roboticProjectImpacts-A1'
}

describe('Create desirability message', () => {
  let createMsg
  let msg

  beforeEach(() => {
    jest.mock('../../../app/content-mapping', () => ({
      desirabilityQuestions: mockQuestionContent,
      desirabilityInputQuestionMapping: {
        projectSubject: 'project-subject',
        projectImpacts: 'project-impacts',
        dataAnalytics: 'robotics-data-analytics',
        energySource: 'robotics-energy-source',
        agriculturalSector: 'robotics-agricultural-sector',
        projectImpact: 'robotics-project-impact'
      }
    }))
    createMsg = require('../../../app/messaging/create-desirability-msg')
    msg = createMsg(mockUserInput)
  })

  test('adds desirability property with questions', () => {
    expect(msg.desirability).toBeDefined()
    expect(msg.desirability.questions).toBeDefined()
  })

  test('contains the correct questions', () => {
    const questionKeys = msg.desirability.questions.map(q => q.key)
    expect(questionKeys.length).toEqual(5)
    expect(questionKeys).toEqual(expect.arrayContaining(desirabilityQuestions))
  })

  test('contains the correct answers', () => {
    const questions = msg.desirability.questions
    const projectSubject = questions.find(q => q.key === 'projectSubject')
    const dataAnalytics = questions.find(q => q.key === 'dataAnalytics')
    const energySource = questions.find(q => q.key === 'energySource')
    const agriculturalSector = questions.find(q => q.key === 'agriculturalSector')
    const roboticProjectImpacts = questions.find(q => q.key === 'roboticProjectImpacts')

    const dataAnalyticsAnswers = dataAnalytics.answers.find(a => a.key === 'dataAnalytics')
    const energySourceAnswers = energySource.answers.find(a => a.key === 'energySource')
    const agriculturalSectorAnswers = agriculturalSector.answers.find(a => a.key === 'agriculturalSector')

    expect(projectSubject.answers.length).toEqual(1)
    expect(projectSubject.answers[0].title).toEqual('projectSubject title')
    expect(projectSubject.answers[0].input.length).toEqual(1)
    expect(projectSubject.answers[0].input[0].value).toEqual(mockUserInput.projectSubject)

    expect(dataAnalytics.answers.length).toEqual(1)
    expect(dataAnalyticsAnswers.title).toEqual('dataAnalytics title')
    expect(dataAnalyticsAnswers.input.length).toEqual(1)
    expect(dataAnalyticsAnswers.input[0].value).toEqual(mockUserInput.dataAnalytics)

    expect(energySource.answers.length).toEqual(1)
    expect(energySourceAnswers.title).toEqual('energySource title')
    expect(energySourceAnswers.input.length).toEqual(mockUserInput.energySource.length)
    expect(energySourceAnswers.input[0].value).toEqual(mockUserInput.energySource[0])

    expect(agriculturalSector.answers.length).toEqual(1)
    expect(agriculturalSectorAnswers.title).toEqual('agriculturalSector title')
    expect(agriculturalSectorAnswers.input.length).toEqual(mockUserInput.agriculturalSector.length)
    expect(agriculturalSectorAnswers.input).toEqual(expect.arrayContaining([expect.objectContaining({ value: mockUserInput.agriculturalSector[0] })]))
    expect(agriculturalSectorAnswers.input).toEqual(expect.arrayContaining([expect.objectContaining({ value: mockUserInput.agriculturalSector[1] })]))

    expect(roboticProjectImpacts.answers.length).toEqual(1)
    expect(roboticProjectImpacts.answers[0].title).toEqual('roboticProjectImpacts title')
    expect(roboticProjectImpacts.answers[0].input.length).toEqual(1)
    expect(roboticProjectImpacts.answers[0].input[0].value).toEqual(mockUserInput.roboticProjectImpacts)
  })

  test('adds rating to each question', () => {
    const ratingObj = { score: null, band: null, importance: null }
    msg.desirability.questions.forEach(q => expect(q.rating).toMatchObject(ratingObj))
  })

  test('adds overall rating to desirability', () => {
    expect(msg.desirability.overallRating).toMatchObject({ score: null, band: null })
  })
})
