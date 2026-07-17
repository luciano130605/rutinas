

const BASE_URL = 'https://j3prwv26-4000.brs.devtunnels.ms/api';

async function request(path, params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ).toString();
  const url = `${BASE_URL}${path}${query ? `?${query}` : ''}`;
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.error || 'Error al consultar el backend');
  return json;
}

export function getMuscles() {
  return request('/muscles').then((r) => r.data);
}

export function getBodyParts() {
  return request('/bodyparts').then((r) => r.data);
}

export function getEquipments() {
  return request('/equipments').then((r) => r.data);
}

// { muscle, bodyPart, equipment, search, page, pageSize }
export function getExercises(filters = {}) {
  return request('/exercises', filters); // devuelve { data, pagination }
}

export function getExerciseById(id) {
  return request(`/exercises/${id}`).then((r) => r.data);
}

/*
Ejemplo de uso dentro de ExercisePickerModal.jsx:

const [muscles, setMuscles] = useState([]);
const [muscleFilter, setMuscleFilter] = useState('');
const [results, setResults] = useState([]);
const [page, setPage] = useState(1);
const [pagination, setPagination] = useState(null);

useEffect(() => { getMuscles().then(setMuscles); }, []);

useEffect(() => {
  const timeout = setTimeout(() => {
    getExercises({ muscle: muscleFilter, search: query, page })
      .then(({ data, pagination }) => { setResults(data); setPagination(pagination); });
  }, 300); // debounce
  return () => clearTimeout(timeout);
}, [muscleFilter, query, page]);

// render:
// {results.map(ex => (
//   <div key={ex.id}>
//     <img src={ex.gifUrl} alt={ex.name} width={80} />
//     <span>{ex.name}</span>
//     <span>{ex.muscle}</span>
//   </div>
// ))}
*/
