export default function convertSubjectNameToUTF8(subjectName) {
    let subjectFormated;

    switch (subjectName) {
      case "portugues":
        subjectFormated = "Português";
        break;
      case "ingles":
        subjectFormated = "Inglês";
        break;
      case "fisica":
        subjectFormated = "Física";
        break;
      case "quimica":
        subjectFormated = "Química";
        break;
      case "historia":
        subjectFormated = "História";
        break;
      case "matematica":
        subjectFormated = "Matemática";
        break;
      case "artisticas":
        subjectFormated = "Artísticas";
        break;
      default:
        subjectFormated = subjectName.replace(
          subjectName[0],
          subjectName[0].toUpperCase()
        );
    }

    return subjectFormated
}
