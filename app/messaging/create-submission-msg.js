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

function getProjectItems (projectItems, infrastructure, roboticEquipment) {
  projectItems = [projectItems].flat()
  if (infrastructure === 'acidification infrastructure') {
    return projectItems.push(infrastructure).join('|').substring(0, 60)
  } else if (roboticEquipment) {
    return projectItems.push(roboticEquipment).join('|').substring(0, 60)
  }
  return projectItems.join('|').substring(0, 60)
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

function addAgentDetails (agentsDetails) {
  return [
    generateRow(26, 'Agent Surname', agentsDetails?.lastName ?? ''),
    generateRow(27, 'Agent Forename', agentsDetails?.firstName ?? ''),
    generateRow(29, 'Agent Address line 1', agentsDetails?.address1 ?? ''),
    generateRow(30, 'Agent Address line 2', agentsDetails?.address2 ?? ''),
    generateRow(31, 'Agent Address line 3', ''),
    generateRow(32, 'Agent Address line 4 (town)', agentsDetails?.town ?? ''),
    generateRow(33, 'Agent Address line 5 (County)', agentsDetails?.county ?? ''),
    generateRow(34, 'Agent Postcode (use capitals)', agentsDetails?.postcode ?? ''),
    generateRow(35, 'Agent Landline number', agentsDetails?.landlineNumber ?? ''),
    generateRow(36, 'Agent Mobile number', agentsDetails?.mobileNumber ?? ''),
    generateRow(37, 'Agent Email', agentsDetails?.emailAddress ?? ''),
    generateRow(28, 'Agent Business Name', agentsDetails?.businessName ?? '')
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
          generateRow(43, 'Theme', submission.projectSubject),
          generateRow(90, 'Project type', submission.projectSubject),
          generateRow(41, 'Owner', 'RD'),
          generateRow(341, 'Grant Launch Date', ''),
          generateRow(23, 'Status of applicant', submission.legalStatus),
          generateRow(45, 'Location of project (postcode)', submission.projectPostcode),
          generateRow(376, 'Project Started', submission.projectStart),
          generateRow(342, 'Land owned by Farm', submission.tenancy),
          generateRow(343, 'Tenancy for next 5 years', submission.tenancyLength ?? ''),
          generateRow(55, 'Total project expenditure', String(submission.projectCost)),
          generateRow(57, 'Grant rate', '40'),
          generateRow(56, 'Grant amount requested', submission.calculatedGrant),
          generateRow(345, 'Remaining Cost to Farmer', submission.remainingCost),
          generateRow(346, 'Planning Permission Status', submission.planningPermission),
          generateRow(377, 'Low emission application equipment', submission.slurryApplication ?? ''),
          generateRow(382, 'First Adoption', submission.projectImpacts ?? ''),
          generateRow(383, 'Current Slurry Acidify Volume', submission.slurryCurrentlyTreated ?? ''),
          generateRow(384, 'Future Slurry Acidify Volume', submission.slurryToBeTreated ?? ''),
          generateRow(378, 'Data Analytics', submission.dataAnalytics ?? ''),
          generateRow(379, 'Energy Type', [submission.energySource].flat().join('|') ?? ''),
          generateRow(380, 'Agricultural Sector for Grant Item', [submission.agriculturalSector].flat().join('|') ?? ''),
          generateRow(381, 'Currently using Grant Item', submission.technology ?? ''),
          // generateRow(354, 'Irrigation Hectare Score', getQuestionScoreBand(desirabilityScore.desirability.questions, 'projectImpact')),
          generateRow(49, 'Site of Special Scientific Interest (SSSI)', submission.sSSI ?? ''),
          generateRow(365, 'OA score', desirabilityScore.desirability.overallRating.band),
          generateRow(366, 'Date of OA decision', ''),
          generateRow(42, 'Project name', submission.businessDetails.projectName),
          generateRow(4, 'Single business identifier (SBI)', submission.businessDetails.sbi || '000000000'), // sbi is '' if not set so use || instead of ??
          generateRow(7, 'Business name', submission.businessDetails.businessName),
          generateRow(367, 'Annual Turnover', submission.businessDetails.businessTurnover),
          generateRow(22, 'Employees', submission.businessDetails.numberEmployees),
          generateRow(20, 'Business size', calculateBusinessSize(submission.businessDetails.numberEmployees, submission.businessDetails.businessTurnover)),
          generateRow(44, 'Project Items', getProjectItems(submission.projectItems, submission.acidificationInfrastructure, submission.roboticEquipment)),
          generateRow(91, 'Are you an AGENT applying on behalf of your customer', submission.applying === 'Agent' ? 'Yes' : 'No'),
          generateRow(5, 'Surname', submission.farmerDetails.lastName),
          generateRow(6, 'Forename', submission.farmerDetails.firstName),
          generateRow(8, 'Address line 1', submission.farmerDetails.address1),
          generateRow(9, 'Address line 2', submission.farmerDetails.address2),
          generateRow(10, 'Address line 3', ''),
          generateRow(11, 'Address line 4 (town)', submission.farmerDetails.town),
          generateRow(12, 'Address line 5 (county)', submission.farmerDetails.county),
          generateRow(13, 'Postcode (use capitals)', submission.farmerDetails.postcode),
          generateRow(16, 'Landline number', submission.farmerDetails.landlineNumber ?? ''),
          generateRow(17, 'Mobile number', submission.farmerDetails.mobileNumber ?? ''),
          generateRow(18, 'Email', submission.farmerDetails.emailAddress),
          generateRow(89, 'Customer Marketing Indicator', submission.consentOptional ? 'Yes' : 'No'),
          generateRow(368, 'Date ready for QC or decision', todayStr),
          generateRow(369, 'Eligibility Reference No.', submission.confirmationId),
          generateRow(94, 'Current location of file', 'NA Automated'),
          generateRow(92, 'RAG rating', 'Green'),
          generateRow(93, 'RAG date reviewed ', todayStr),
          generateRow(54, 'Electronic OA received date ', todayStr),
          generateRow(370, 'Status', 'Pending RPA review'),
          generateRow(85, 'Full Application Submission Date', (new Date(today.setMonth(today.getMonth() + 6))).toLocaleDateString('en-GB')),
          generateRow(375, 'OA percent', String(desirabilityScore.desirability.overallRating.score)),
          ...addAgentDetails(submission.agentsDetails)
        ]
      }
    ]
  }
}

function getCurrencyFormat (amount) {
  return Number(amount).toLocaleString('en-US', { minimumFractionDigits: 0, style: 'currency', currency: 'GBP' })
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

function getEmailDetails (submission, desirabilityScore, rpaEmail, isAgentEmail = false) {
  const email = isAgentEmail ? submission.agentsDetails.emailAddress : submission.farmerDetails.emailAddress
  return {
    notifyTemplate: emailConfig.notifyTemplate,
    emailAddress: rpaEmail || email,
    details: {
      firstName: isAgentEmail ? submission.agentsDetails.firstName : submission.farmerDetails.firstName,
      lastName: isAgentEmail ? submission.agentsDetails.lastName : submission.farmerDetails.lastName,
      referenceNumber: submission.confirmationId,
      overallRating: desirabilityScore.desirability.overallRating.band,
      scoreChance: getScoreChance(desirabilityScore.desirability.overallRating.band),
      projectSubject: submission.projectSubject,
      isSlurry: submission.projectSubject === 'Slurry acidification' ? 'Yes' : 'No',
      isRobotics: submission.projectSubject === 'Robotics and innovation' ? 'Yes' : 'No',
      legalStatus: submission.legalStatus,
      location: `England ${submission.projectPostcode}`,
      planningPermission: submission.planningPermission,
      projectStart: submission.projectStart,
      tenancy: submission.tenancy,
      tenancyLength: submission.tenancyLength ?? 'n/a',
      projectItems: submission.projectItems,
      acidificationInfrastructure: submission.acidificationInfrastructure ?? ' ',
      slurryApplication: submission.slurryApplication ?? ' ',
      projectCost: getCurrencyFormat(submission.projectCost),
      potentialFunding: getCurrencyFormat(submission.calculatedGrant),
      remainingCost: getCurrencyFormat(submission.remainingCost),
      sssi: submission.sSSI ?? ' ',
      slurryCurrentlyTreated: submission.slurryCurrentlyTreated ?? ' ',
      slurryToBeTreated: submission.slurryToBeTreated ?? ' ',
      projectImpacts: submission.projectImpacts ?? ' ',
      dataAnalytics: submission.dataAnalytics ?? ' ',
      dataAnalyticsScore: submission.dataAnalytics ? getQuestionScoreBand(desirabilityScore.desirability.questions, 'robotics-data-analytics') : ' ',
      energySource: submission.energySource ?? ' ',
      energySourceScore: submission.projectSubject === 'Robotics and innovation' ? getQuestionScoreBand(desirabilityScore.desirability.questions, 'robotics-energy-source') : ' ',
      agriculturalSector: submission.agriculturalSector ?? ' ',
      agriculturalSectorScore: submission.projectSubject === 'Robotics and innovation' ? getQuestionScoreBand(desirabilityScore.desirability.questions, 'robotics-agricultural-sector') : ' ',
      technology: submission.technology ?? ' ',
      technologyScore: submission.projectSubject === 'Robotics and innovation' ? getQuestionScoreBand(desirabilityScore.desirability.questions, 'robotics-technology') : ' ',
      projectName: submission.businessDetails.projectName,
      businessName: submission.businessDetails.businessName,
      farmerName: submission.farmerDetails.firstName,
      farmerSurname: submission.farmerDetails.lastName,
      farmerEmail: submission.farmerDetails.emailAddress,
      agentName: submission.agentsDetails?.firstName ?? 'n/a',
      agentSurname: submission.agentsDetails?.lastName ?? ' ',
      agentEmail: submission.agentsDetails?.email ?? 'n/a',
      projectImpactsScore: submission.projectSubject === 'Slurry acidification' ? getQuestionScoreBand(desirabilityScore.desirability.questions, 'project-impacts') : ' ',
      contactConsent: submission.consentOptional ? 'Yes' : 'No',
      scoreDate: new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })

    }
  }
}
function spreadsheet (submission, desirabilityScore) {
  console.log(getSpreadsheetDetails(submission, desirabilityScore).worksheets[0],'LLLLLLLLLL')
  return getSpreadsheetDetails(submission, desirabilityScore)
}

module.exports = function (submission, desirabilityScore) {
  return {
    applicantEmail: getEmailDetails(submission, desirabilityScore, false),
    agentEmail: submission.applying === 'Agent' ? getEmailDetails(submission, desirabilityScore, false, true) : null,
    rpaEmail: spreadsheetConfig.sendEmailToRpa ? getEmailDetails(submission, desirabilityScore, spreadsheetConfig.rpaEmail) : null,
    spreadsheet: spreadsheet(submission, desirabilityScore)
  }
}
