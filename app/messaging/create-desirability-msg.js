const grantSchemeConfig = require('../config/grant-scheme')
const { desirabilityQuestions: questionContent } = require('../content-mapping')
const desirabilityQuestions = ['projectSubject', 'projectImpacts', 'dataAnalytics', 'energySource', 'agriculturalSector', 'roboticProjectImpacts']

function getUserAnswer (answers, userInput) {
  console.log('get answer User Input', userInput)
  console.log('get answer Answers', answers)

  if (answers) {
    return [userInput].flat().map(answer =>
      ({ key: Object.keys(answers).find(key => answers[key] === answer), value: answer }))
  } else {
    return [{ key: null, value: userInput }]
  }
}

function getDesirabilityDetails (questionKey, userInput) {
  console.log('questionKey', questionKey)
  const content = questionContent[questionKey]
  return {
    key: content[0].key,
    answers: content.map(({ key, title, answers }) => ({
      key,
      title,
      input: getUserAnswer(answers, userInput[questionKey])
    })),
    rating: {
      score: null,
      band: null,
      importance: null
    }
  }
}

function desirability (userInput) {
  console.log(userInput, 'userinput')
  const key = userInput.projectSubject === 'Slurry acidification' ? 'PROD01' : 'PROD02'
  const grantScheme = grantSchemeConfig.filter(g => g.key === key)[0]
  const answeredQuestions = []
  desirabilityQuestions.forEach(questionKey => {
    if (userInput[questionKey]) answeredQuestions.push(getDesirabilityDetails(questionKey, userInput))
  })
  return {
    grantScheme: {
      key: grantScheme.key,
      name: grantScheme.name
    },
    desirability: {
      questions: answeredQuestions,
      overallRating: {
        score: null,
        band: null
      }
    }
  }
}

module.exports = desirability
