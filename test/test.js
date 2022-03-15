const assert = require('assert');
const should = require('should');
const jsonTemplateMerge = require('../lib/json-template-merge');
const JsonTemplate = require('./jsonTemplate');

describe('JsonTemplateMerge', function() {

    describe('#merge3', function() {

        let live, base, source, expected;

        live = new JsonTemplate().addSection('common').addSectionWithSettings('live').addSection('deleteme');
        base = new JsonTemplate().addSection('common').addSection('deleteme');
        source = new JsonTemplate(base).addSection('source').removeSection('deleteme');

        expected = new JsonTemplate().addSection('common').addSectionWithSettings('live').addSection('source');
        
        it('should merge json templates', function() {

            let output = jsonTemplateMerge.merge3(live.get(), base.get(), source.get());
            output.should.be.eql(expected.get());
        });
    });
});