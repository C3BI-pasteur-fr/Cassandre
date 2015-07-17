var mongoose = require('mongoose');
var _ = require('underscore');
var exports = {};

var EdamSchema = mongoose.Schema({
    "@id": String,
    "@type": String,
    "_id": String,
    "created_in": String,
    "dc:creator": String,
    "dc:format": String,
    "dc:title": String,
    "doap:version": String,
    "documentation": String,
    "example": String,
    "foaf:page": String,
    "next_id": String,
    "noClue": String,
    "oboInOwl:consider": String,
    "oboInOwl:hasAlternativeId": String,
    "oboInOwl:hasBroadSynonym": String,
    "oboInOwl:hasDbXref": String,
    "oboInOwl:hasDefinition": String,
    "oboInOwl:hasExactSynonym": String,
    "oboInOwl:hasNarrowSynonym": String,
    "oboInOwl:hasRelatedSynonym": String,
    "oboInOwl:hasSubset": String,
    "oboInOwl:inSubset": String,
    "oboInOwl:isCyclic": String,
    "oboInOwl:replacedBy": String,
    "oboInOwl:savedBy": String,
    "oboOther:date": String,
    "oboOther:default-relationship-id-prefix": String,
    "oboOther:idspace": String,
    "oboOther:is_anti_symmetric": String,
    "oboOther:is_metadata_tag": String,
    "oboOther:is_reflexive": String,
    "oboOther:is_symmetric": String,
    "oboOther:remark": String,
    "oboOther:transitive_over": String,
    "obsolete_since": String,
    "owl:annotatedProperty": String,
    "owl:annotatedSource": String,
    "owl:annotatedTarget": String,
    "owl:deprecated": String,
    "owl:disjointWith": String,
    "owl:inverseOf": String,
    "owl:onProperty": String,
    "owl:someValuesFrom": String,
    "owl:unionOf": String,
    "rdfs:comment": String,
    "rdfs:domain": String,
    "rdfs:isDefinedBy": String,
    "rdfs:label": String,
    "rdfs:range": String,
    "rdfs:seeAlso": String,
    "rdfs:subClassOf": String,
    "rdfs:subPropertyOf": String,
    "regex": String
});

var Edam = mongoose.model('Edam', EdamSchema);

module.exports = {
    edam: Edam
};