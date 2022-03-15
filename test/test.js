const assert = require('assert');
const should = require('should');
const jsonTemplateMerge = require('../lib/json-template-merge');
const JsonTemplate = require('./jsonTemplate');

describe('JsonTemplateMerge', function() {

    describe('#merge3', function() {

        let ours, theirs, base, expected;

        base = new JsonTemplate().addSection('base').addSection('common-1').addSection('common-2');
        ours = new JsonTemplate(base).addSection('ours');
        theirs = new JsonTemplate(base).addSectionWithSettings('theirs');
        
        expected = new JsonTemplate(base).addSection('ours').addSectionWithSettings('theirs');
        
        it('should add new sections', function() {

            let output = jsonTemplateMerge.merge3(ours.get(), base.get(), theirs.get());
            output.should.be.eql(expected.get());
        });

        ours.removeSection('common-1');
        theirs.removeSection('common-2');
        expected.removeSection('common-1').removeSection('common-2');

        it('should remove sections', function() {

            let output = jsonTemplateMerge.merge3(ours.get(), base.get(), theirs.get());
            output.should.be.eql(expected.get());
        });

        theirs.removeSection('common-1');

        it('shouldn\'t remove already removed sections', function() {

            let output = jsonTemplateMerge.merge3(ours.get(), base.get(), theirs.get());
            output.should.be.eql(expected.get());
        });

        theirs.bringToFront('theirs');

        it('should use order from ours', function() {

            let output = jsonTemplateMerge.merge3(ours.get(), base.get(), theirs.get());
            output.should.be.eql(expected.get());
        });
    });
});