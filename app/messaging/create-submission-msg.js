const emailConfig = require('../config/email')
const spreadsheetConfig = require('../config/spreadsheet')

function getQuestionScoreBand (questions, questionKey) {
  return questions.find(question => question.key === questionKey).rating.band
}

function generateRow (rowNumber, name, value, bold = false) {
  return {
    row: rowNumber,
    values: ['', name, value],
    bold
  }
}

function farmingTypeMapping (farmingType) {
  switch (farmingType) {
    case 'Crops for the food industry':
      return 'Arable farmer'
    case 'Horticulture (including ornamentals)':
      return 'Horticultural business'
    default:
      return 'Error: failed to map farming type'
  }
}

function calculateBusinessSize (employees, turnover) {
  const employeesNum = Number(employees)
  const turnoverNum = Number(turnover)

  if (employeesNum < 10 && turnoverNum < 1740000) { // €2m turnover
    return 'Micro'
  } else if (employeesNum < 50 && turnoverNum < 8680000) { // €10m turnover
    return 'Small'
  } else if (employeesNum < 250 && turnoverNum < 43410000) { // €50m turnover
    return 'Medium'
  } else {
    return 'Large'
  }
}

function addAgentDetails (agentDetails) {
  return [
    generateRow(26, 'Agent Surname', agentDetails?.lastName ?? ''),
    generateRow(27, 'Agent Forename', agentDetails?.firstName ?? ''),
    generateRow(29, 'Agent Address line 1', agentDetails?.address1 ?? ''),
    generateRow(30, 'Agent Address line 2', agentDetails?.address2 ?? ''),
    generateRow(32, 'Agent Address line 4 (town)', agentDetails?.town ?? ''),
    generateRow(33, 'Agent Address line 5 (County)', agentDetails?.county ?? ''),
    generateRow(34, 'Agent Postcode (use capitals)', agentDetails?.postcode ?? ''),
    generateRow(35, 'Agent Landline number', agentDetails?.landline ?? ''),
    generateRow(36, 'Agent Mobile number', agentDetails?.mobile ?? ''),
    generateRow(37, 'Agent Email', agentDetails?.email ?? ''),
    generateRow(28, 'Agent Business Name', agentDetails?.businessName ?? '')
  ]
}

function generateExcelFilename (scheme, projectName, businessName, referenceNumber, today) {
  const dateTime = new Intl.DateTimeFormat('en-GB', {
    timeStyle: 'short',
    dateStyle: 'short',
    timeZone: 'Europe/London'
  }).format(today).replace(/\//g, '-')
  return `${scheme}_${projectName}_${businessName}_${referenceNumber}_${dateTime}.xlsx`
}

function getSpreadsheetDetails (submission, desirabilityScore) {
  const today = new Date()
  const todayStr = today.toLocaleDateString('en-GB')
  const subScheme = 'FTF-Productivity'

  return {
    filename: generateExcelFilename(
      subScheme.trim(),
      submission.businessDetails.projectName.trim(),
      submission.businessDetails.businessName.trim(),
      submission.confirmationId.trim(),
      today
    ),
    uploadLocation: `Farming Investment Fund/Farming Transformation Fund/${spreadsheetConfig.uploadEnvironment}/Productivity/`,
    worksheets: [
      {
        title: 'DORA DATA',
        ...(spreadsheetConfig.protectEnabled ? { protectPassword: spreadsheetConfig.protectPassword } : {}),
        hideEmptyRows: spreadsheetConfig.hideEmptyRows,
        defaultColumnWidth: 30,
        rows: [
          generateRow(1, 'Field Name', 'Field Value', true),
          generateRow(2, 'FA or OA', 'Outline Application'),
          generateRow(40, 'Scheme', 'Farming Transformation Fund'),
          generateRow(39, 'Sub scheme', subScheme),
          generateRow(43, 'Theme', 'Productivity Resource Management'),
          generateRow(90, 'Project type', 'Productivity management'),
          generateRow(41, 'Owner', 'RD'),
          generateRow(341, 'Grant Application Window', ''),
          generateRow(53, 'Business Type', farmingTypeMapping(submission.farmingType)),
          generateRow(23, 'Status of applicant', submission.legalStatus),
          generateRow(45, 'Location of project (postcode)', submission.projectPostcode),
          generateRow(342, 'Land owned by Farm', submission.landOwnership),
          generateRow(343, 'Tenancy for next 5 years', submission.tenancyLength ?? ''),
          generateRow(344, 'Irrigation Infrastructure ', submission.projectItemsList.join('|')),
          generateRow(55, 'Total project expenditure', String(submission.projectCost)),
          generateRow(57, 'Grant rate', '40'),
          generateRow(56, 'Grant amount requested', submission.calculatedGrant),
          generateRow(345, 'Remaining Cost to Farmer', submission.remainingCost),
          generateRow(346, 'Planning Permission Status', submission.planningPermission),
          generateRow(347, 'Abstraction License Status', submission.abstractionLicence),
          generateRow(348, 'Irrigation Impact', submission.project.join('|')),
          generateRow(349, 'Irrigation Impact Score', getQuestionScoreBand(desirabilityScore.desirability.questions, 'projectSubject')),
          generateRow(350, 'Irrigation Farming Scale (AKA Crop Type)', submission.irrigatedCrops),
          generateRow(351, 'Irrigation Crop Score', ''),
          generateRow(352, 'As-Is Irrigation (ha)', submission.irrigatedLandCurrent),
          generateRow(353, 'To-Be Irrigation (ha)', submission.irrigatedLandTarget),
          generateRow(354, 'Irrigation Hectare Score', getQuestionScoreBand(desirabilityScore.desirability.questions, 'projectImpact')),
          generateRow(355, 'As-Is Productivity Source', submission.ProductivitySourceCurrent.join('|')),
          generateRow(356, 'To-Be Productivity Source', submission.ProductivitySourcePlanned.join('|')),
          generateRow(357, 'Productivity Source Score', getQuestionScoreBand(desirabilityScore.desirability.questions, 'dataAnalytics')),
          generateRow(358, 'As-Is Irrigation Method', submission.irrigationCurrent.join('|')),
          generateRow(359, 'To-Be Irrigation Method', submission.irrigationPlanned.join('|')),
          generateRow(360, 'Irrigation Method Score', getQuestionScoreBand(desirabilityScore.desirability.questions, 'energySource')),
          generateRow(361, 'Irrigation Productivity Benefit', submission.productivity.join('|')),
          generateRow(362, 'Irrigation Productivity Score', getQuestionScoreBand(desirabilityScore.desirability.questions, 'agriculturalSector')),
          generateRow(363, 'Benefits Other Farms', submission.collaboration),
          generateRow(49, 'Site of Special Scientific Interest (SSSI)', submission.sSSI),
          generateRow(365, 'OA score', desirabilityScore.desirability.overallRating.band),
          generateRow(366, 'Date of OA decision', ''),
          generateRow(42, 'Project name', submission.businessDetails.projectName),
          generateRow(4, 'Single business identifier (SBI)', submission.businessDetails.sbi || '000000000'), // sbi is '' if not set so use || instead of ??
          generateRow(7, 'Business name', submission.businessDetails.businessName),
          generateRow(367, 'Annual Turnover', submission.businessDetails.businessTurnover),
          generateRow(22, 'Employees', submission.businessDetails.numberEmployees),
          generateRow(20, 'Business size', calculateBusinessSize(submission.businessDetails.numberEmployees, submission.businessDetails.businessTurnover)),
          generateRow(44, 'Description of project', submission.projectItemsList.join(', ').substring(0, 60)),
          generateRow(91, 'Are you an AGENT applying on behalf of your customer', submission.applying === 'Agent' ? 'Yes' : 'No'),
          generateRow(5, 'Surname', submission.farmerDetails.lastName),
          generateRow(6, 'Forename', submission.farmerDetails.firstName),
          generateRow(25, 'Main applicant gender', 'Applicant preferred not to say'),
          generateRow(24, 'Main applicant age', 'Applicant preferred not to say'),
          generateRow(8, 'Address line 1', submission.farmerDetails.address1),
          generateRow(9, 'Address line 2', submission.farmerDetails.address2),
          generateRow(11, 'Address line 4 (town)', submission.farmerDetails.town),
          generateRow(12, 'Address line 5 (county)', submission.farmerDetails.county),
          generateRow(13, 'Postcode (use capitals)', submission.farmerDetails.postcode),
          generateRow(16, 'Landline number', submission.farmerDetails.landline),
          generateRow(17, 'Mobile number', submission.farmerDetails.mobile),
          generateRow(18, 'Email', submission.farmerDetails.email),
          generateRow(89, 'Customer Marketing Indicator', submission.consentOptional ? 'Yes' : 'No'),
          generateRow(368, 'Date ready for QC or decision', todayStr),
          generateRow(369, 'Eligibility Reference No.', submission.confirmationId),
          generateRow(94, 'Current location of file', 'NA Automated'),
          generateRow(92, 'RAG rating', 'Green'),
          generateRow(93, 'RAG date reviewed ', todayStr),
          generateRow(54, 'Electronic OA received date ', todayStr),
          generateRow(370, 'Status', 'Pending RPA review'),
          generateRow(371, 'Rationale', ''),
          generateRow(372, 'Decision maker', ''),
          generateRow(85, 'Full Application Submission Date', (new Date(today.setMonth(today.getMonth() + 6))).toLocaleDateString('en-GB')),
          generateRow(95, 'Measure table', '99'),
          generateRow(96, 'Measure year', '99'),
          generateRow(375, 'OA percent', String(desirabilityScore.desirability.overallRating.score)),
          ...addAgentDetails(submission.agentDetails)
        ]
      }
    ]
  }
}

function getScoreChance (rating) {
  switch (rating.toLowerCase()) {
    case 'strong':
      return 'seems likely to'
    case 'average':
      return 'might'
    default:
      return 'seems unlikely to'
  }
}

function getEmailDetails (submission, desirabilityScore, rpaEmail) {
  const email = submission.applying === 'Agent' ? submission.agentDetails.email : submission.farmerDetails.emailAddress
  return {
    notifyTemplate: emailConfig.notifyTemplate,
    emailAddress: rpaEmail || email,
    details: {
      firstName: submission.applying === 'Agent' ? submission.agentDetails.firstName : submission.farmerDetails.firstName,
      lastName: submission.applying === 'Agent' ? submission.agentDetails.lastName : submission.farmerDetails.lastName,
      referenceNumber: submission.confirmationId,
      overallRating: desirabilityScore.desirability.overallRating.band,
      scoreChance: getScoreChance(desirabilityScore.desirability.overallRating.band),
      projectSubject: submission.projectSubject,
      legalStatus: submission.legalStatus,
      location: `England ${submission.projectPostcode}`,
      planningPermission: submission.planningPermission,
      projectStart: submission.projectStart,
      tenancy: submission.tenancy,
      tenancyLength: submission.tenancyLength ?? 'N/A',
      projectItems: submission.projectItems,
      acidificationInfrastructure: submission.acidificationInfrastructure,
      slurryApplication: submission.slurryApplication,
      projectCost: Number(submission.projectCost).toLocaleString('en-US', { style: 'currency', currency: 'GBP' }),
      potentialFunding: Number(submission.calculatedGrant).toLocaleString('en-US', { style: 'currency', currency: 'GBP' }),
      remainingCost: Number(submission.remainingCost).toLocaleString('en-US', { style: 'currency', currency: 'GBP' }),
      sssi: submission.sSSI,
      slurryCurrentlyTreated: submission.slurryCurrentlyTreated ?? '0',
      slurryToBeTreated: submission.slurryToBeTreated,
      projectImpacts: submission.projectImpacts,
      projectName: submission.businessDetails.projectName,
      businessName: submission.businessDetails.businessName,
      farmerName: submission.farmerDetails.firstName,
      farmerSurname: submission.farmerDetails.lastName,
      farmerEmail: submission.farmerDetails.emailAddress,
      agentName: submission.agentDetails?.firstName ?? 'N/A',
      agentSurname: submission.agentDetails?.lastName ?? ' ',
      agentEmail: submission.agentDetails?.email ?? 'N/A',

      // projectImpactsScore: getQuestionScoreBand(desirabilityScore.desirability.questions, 'project-impacts'),
      contactConsent: submission.consentOptional ? 'Yes' : 'No',
      scoreDate: new Date().toLocaleDateString('en-GB')

    }
  }
}

module.exports = function (submission, desirabilityScore) {
  return {
    applicantEmail: getEmailDetails(submission, desirabilityScore, false),
    agentEmail: submission.applying === 'Agent' ? getEmailDetails(submission, desirabilityScore, false) : '',
    rpaEmail: spreadsheetConfig.sendEmailToRpa ? getEmailDetails(submission, desirabilityScore, spreadsheetConfig.rpaEmail) : ''
    //spreadsheet: getSpreadsheetDetails(submission, desirabilityScore)
  }
}
