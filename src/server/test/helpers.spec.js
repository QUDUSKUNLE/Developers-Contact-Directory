import chai from 'chai';
import pagination from '../helpers/pagination';
import normalize from '../helpers/normalize';
import userData from '../__mock__/mockData';

chai.should();
chai.should();
const { expect } = chai;

// Test for pagination function
describe('Test', () => {
  const { user } = userData;
  describe('pagination helper ', () => {
    it('is expected', () => {
      expect(pagination).to.be.a('function');
    });
    it(`function should return page, pageCount
    and count when called`, (done) => {
      expect(pagination(user.count, user.limit, user.offset))
        .to.have.keys(['page', 'pageCount', 'count']);
      done();
    });
    it('function should return an object when called', (done) => {
      expect(pagination(user.count, user.limit, user.offset)).to.be.an('object');
      done();
    });
    it('function should return', (done) => {
      expect(pagination(user.count, user.limit, user.offset))
        .to.eql({
          page: 1, pageCount: 2, count: user.count
        });
      done();
    });
  });

  describe('normalize helper ', () => {
    it('is expected', () => {
      expect(normalize.text).to.be.a('function');
      expect(normalize.extractData).to.be.a('function');
    });
    it('function should return normalize value when called', (done) => {
      expect(normalize.text('backend Developer'))
        .to.eql('Backend Developer');
      done();
    });
    it('function should return normalize value when called', (done) => {
      expect(normalize.extractData(user.extract))
        .to.eql(user.extractVal);
      done();
    });
  });
});
