export const getGenderedText = (gender, maleText, femaleText) => {
    return gender === 'female' ? femaleText : maleText;
  };