export const converseScoreUtil = (score) => {
    let converseScore = 0;
    switch (score) {
        case 'annoying':
            converseScore = 100;
            break;
        case 'disturbing':
            converseScore = 200;
            break;
        case 'extreme':
            converseScore = 300;
            break;
        case 'infectious':
            converseScore = 400;
            break;
        default:
            converseScore = 0;
    }
    return converseScore;
}