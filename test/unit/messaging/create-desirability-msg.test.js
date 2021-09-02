const desirabilityQuestions = ['projectSubject', 'projectImpact', 'dataAnalytics', 'energySource', 'agriculturalSector']

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
  projectImpact: [
    {
      key: 'projectImpact',
      title: 'projectImpact title',
      answers: {
        'projectImpact-A1': 'projectImpact answer'
      }
    }
  ],
  dataAnalytics: [
    {
      key: 'dataAnalyticsa',
      title: 'dataAnalyticsa title'
    },
    {
      key: 'dataAnalyticsb',
      title: 'dataAnalyticsb title'
    }
  ],
  energySource: [
    {
      key: 'energySourcea',
      title: 'energySourcea title',
      answers: {
        'energySourcea-A1': 'energySourcea answer'
      }
    },
    {
      key: 'energySourceb',
      title: 'energySourceb title',
      answers: {
        'energySourceb-A1': 'energySourceb answer'
      }
    }
  ],
  agriculturalSector: [
    {
      key: 'agriculturalSectora',
      title: 'agriculturalSectora title',
      answers: {
        'agriculturalSectora-A1': 'agriculturalSectora answer 1',
        'agriculturalSectora-A2': 'agriculturalSectora answer 2'
      }
    },
    {
      key: 'agriculturalSectorb',
      title: 'agriculturalSectorb title',
      answers: {
        'agriculturalSectorb-A1': 'agriculturalSectorb answer'
      }
    }
  ]
}

const mockUserInput = {
  projectSubject: 'projectSubject-A1',
  projectImpact: 'projectImpact-A1',
  dataAnalytics: 'dataAnalytics-A1',
  energySource: ['energySource-A1', 'energySource-A2'],
  agriculturalSector: 'agriculturalSector-A1'
}

const mockGrantSchemeKey = 'testKey'
const mockGrantSchemeName = 'testName'
const mockGrantScheme = {
  key: mockGrantSchemeKey,
  name: mockGrantSchemeName
}

describe('Create desirability message', () => {
  let createMsg
  let msg

  beforeEach(() => {
    jest.mock('../../../app/config/grant-scheme', () => mockGrantScheme)
    jest.mock('../../../app/content-mapping', () => ({
      desirabilityQuestions: mockQuestionContent,
      desirabilityInputQuestionMapping: {
        projectSubject: 'project',
        projectImpact: 'irrigatedCrops',
        dataAnalyticsa: 'irrigatedLandCurrent',
        dataAnalyticsb: 'irrigatedLandTarget',
        energySourcea: 'waterSourceCurrent',
        energySourceb: 'waterSourcePlanned',
        agriculturalSectora: 'irrigationCurrent',
        agriculturalSectorb: 'irrigationPlanned',
        Q19: 'productivity',
        Q20: 'collaboration'
      }
    }))
    createMsg = require('../../../app/messaging/create-desirability-msg')
    msg = createMsg(mockUserInput)
  })

  test('adds grant scheme details', () => {
    expect(msg.grantScheme).toBeDefined()
    expect(msg.grantScheme.key).toBe(mockGrantSchemeKey)
    expect(msg.grantScheme.name).toBe(mockGrantSchemeName)
  })

  test('adds desirability property with questions', () => {
    expect(msg.desirability).toBeDefined()
    expect(msg.desirability.questions).toBeDefined()
  })

  test('contains the correct questions', () => {
    const questionKeys = msg.desirability.questions.map(q => q.key)
    expect(questionKeys.length).toEqual(desirabilityQuestions.length)
    expect(questionKeys).toEqual(expect.arrayContaining(desirabilityQuestions))
  })

  test('contains the correct answers', () => {
    const questions = msg.desirability.questions
    const projectSubject = questions.find(q => q.key === 'projectSubject')
    const projectImpact = questions.find(q => q.key === 'projectImpact')
    const dataAnalytics = questions.find(q => q.key === 'dataAnalytics')
    const energySource = questions.find(q => q.key === 'energySource')
    const agriculturalSector = questions.find(q => q.key === 'agriculturalSector')
    const q19 = questions.find(q => q.key === 'Q19')
    const q20 = questions.find(q => q.key === 'Q20')

    const dataAnalyticsaAnswers = dataAnalytics.answers.find(a => a.key === 'dataAnalyticsa')
    const dataAnalyticsbAnswers = dataAnalytics.answers.find(a => a.key === 'dataAnalyticsb')
    const energySourceaAnswers = energySource.answers.find(a => a.key === 'energySourcea')
    const energySourcebAnswers = energySource.answers.find(a => a.key === 'energySourceb')
    const agriculturalSectoraAnswers = agriculturalSector.answers.find(a => a.key === 'agriculturalSectora')
    const agriculturalSectorbAnswers = agriculturalSector.answers.find(a => a.key === 'agriculturalSectorb')

    expect(projectSubject.answers.length).toEqual(1)
    expect(projectSubject.answers[0].title).toEqual('projectSubject title')
    expect(projectSubject.answers[0].input.length).toEqual(mockUserInput.project.length)
    expect(projectSubject.answers[0].input).toEqual(expect.arrayContaining([expect.objectContaining({ value: mockUserInput.project[0] })]))
    expect(projectSubject.answers[0].input).toEqual(expect.arrayContaining([expect.objectContaining({ value: mockUserInput.project[1] })]))

    expect(projectImpact.answers.length).toEqual(1)
    expect(projectImpact.answers[0].title).toEqual('projectImpact title')
    expect(projectImpact.answers[0].input.length).toEqual(1)
    expect(projectImpact.answers[0].input[0].value).toEqual(mockUserInput.irrigatedCrops)

    expect(dataAnalytics.answers.length).toEqual(2)
    expect(dataAnalyticsaAnswers.title).toEqual('dataAnalyticsa title')
    expect(dataAnalyticsaAnswers.input.length).toEqual(1)
    expect(dataAnalyticsaAnswers.input[0].value).toEqual(mockUserInput.irrigatedLandCurrent)
    expect(dataAnalyticsbAnswers.title).toEqual('dataAnalyticsb title')
    expect(dataAnalyticsbAnswers.input.length).toEqual(1)
    expect(dataAnalyticsbAnswers.input[0].value).toEqual(mockUserInput.irrigatedLandTarget)

    expect(energySource.answers.length).toEqual(2)
    expect(energySourceaAnswers.title).toEqual('energySourcea title')
    expect(energySourceaAnswers.input.length).toEqual(mockUserInput.waterSourceCurrent.length)
    expect(energySourceaAnswers.input[0].value).toEqual(mockUserInput.waterSourceCurrent[0])
    expect(energySourcebAnswers.title).toEqual('energySourceb title')
    expect(energySourcebAnswers.input.length).toEqual(mockUserInput.waterSourcePlanned.length)
    expect(energySourcebAnswers.input[0].value).toEqual(mockUserInput.waterSourcePlanned[0])

    expect(agriculturalSector.answers.length).toEqual(2)
    expect(agriculturalSectoraAnswers.title).toEqual('agriculturalSectora title')
    expect(agriculturalSectoraAnswers.input.length).toEqual(mockUserInput.irrigationCurrent.length)
    expect(agriculturalSectoraAnswers.input).toEqual(expect.arrayContaining([expect.objectContaining({ value: mockUserInput.irrigationCurrent[0] })]))
    expect(agriculturalSectoraAnswers.input).toEqual(expect.arrayContaining([expect.objectContaining({ value: mockUserInput.irrigationCurrent[1] })]))
    expect(agriculturalSectorbAnswers.title).toEqual('agriculturalSectorb title')
    expect(agriculturalSectorbAnswers.input.length).toEqual(mockUserInput.irrigationPlanned.length)
    expect(agriculturalSectorbAnswers.input[0].value).toEqual(mockUserInput.irrigationPlanned[0])

    expect(q19.answers.length).toEqual(1)
    expect(q19.answers[0].title).toEqual('Q19 title')
    expect(q19.answers[0].input.length).toEqual(mockUserInput.productivity.length)
    expect(q19.answers[0].input[0].value).toEqual(mockUserInput.productivity[0])

    expect(q20.answers.length).toEqual(1)
    expect(q20.answers[0].title).toEqual('Q20 title')
    expect(q20.answers[0].input.length).toEqual(1)
    expect(q20.answers[0].input[0].value).toEqual(mockUserInput.collaboration)
  })

  test('adds rating to each question', () => {
    const ratingObj = { score: null, band: null, importance: null }
    msg.desirability.questions.forEach(q => expect(q.rating).toMatchObject(ratingObj))
  })

  test('adds overall rating to desirability', () => {
    expect(msg.desirability.overallRating).toMatchObject({ score: null, band: null })
  })
})
