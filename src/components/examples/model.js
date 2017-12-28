import ce, { request } from 'cat-eye';
const { api } = request;

ce.model({
  name: 'example',
  state: {
    count: 7
  },
  reducers: {
    change(n) {
      return this.setField({
        count: prev => prev + n
      });
    }
  },
  effects: {
    corsGet() {
      api
        .get('/mock', {
          params: {
            q: 'hello'
          }
        })
        .then(data => {
          this.setField({
            data
          });
        });
    },
    corsPost() {
      api
        .post('/mock', {
          data: {
            name: 'tom'
          }
        })
        .then(data => {
          this.setField({ data });
        });
    }
  }
});
