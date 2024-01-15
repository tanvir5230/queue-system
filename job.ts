class Job {
  id: string;
  data: any;
  constructor(id: string, data: any) {
    this.id = id;
    this.data = data;
  }
  execute(functionToExecute: Function) {
    functionToExecute();
  }
}

export default Job;
