/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership. Camunda licenses this file to you under the Apache License,
 * Version 2.0; you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var fs = require('fs');
var angular = require('angular');
var searchWidgetUtils = require('../../../../../../common/scripts/util/search-widget-utils');

var template = fs.readFileSync(
  __dirname + '/job-definition-table.html',
  'utf8'
);

var Controller = [
  '$scope',
  'Views',
  '$translate',
  'localConf',
  function($scope, Views, $translate, localConf) {
    // prettier-ignore
    $scope.headColumns = [
      { class: 'state',         request: 'suspended'     , sortable: true, content: $translate.instant('PLUGIN_JOBDEFINITION_STATE')},
      { class: 'activity',      request: 'activityName'     , sortable: true, content: $translate.instant('PLUGIN_JOBDEFINITION_ACTIVITY')},
      { class: 'type',          request: 'jobType'         , sortable: true, content: $translate.instant('PLUGIN_JOBDEFINITION_TYPE')},
      { class: 'configuration', request: 'jobConfiguration', sortable: true, content: $translate.instant('PLUGIN_JOBDEFINITION_CONFIGURATION')},
      { class: 'overriding-job-priority', request: 'overridingJobPriority', sortable: true, content: $translate.instant('PLUGIN_JOBDEFINITION_JOB_PRIORITY')},
      { class: 'action',        request: 'action', sortable: false, content: $translate.instant('PLUGIN_JOBDEFINITION_ACTION')}
    ];

    // Default sorting
    $scope.sortObj = loadLocal({
      sortBy: 'suspended',
      sortOrder: 'asc',
      sortReverse: false
    });

    $scope.onSortChange = function(sortObj) {
      sortObj = sortObj || $scope.sortObj;
      // sortReverse required by anqular-sorting;
      sortObj.sortReverse = sortObj.sortOrder !== 'asc';
      saveLocal(sortObj);
      $scope.sortObj = sortObj;
    };

    function saveLocal(sortObj) {
      localConf.set('sortJobDefTab', sortObj);
    }
    function loadLocal(defaultValue) {
      return localConf.get('sortJobDefTab', defaultValue);
    }

    var processData = $scope.processData.newChild($scope);

    processData.observe(['filter', 'jobDefinitions', 'bpmnElements'], function(
      filter,
      jobDefinitions
    ) {
      updateView(filter, jobDefinitions);
    });

    function updateView(filter, jobDefinitions) {
      $scope.jobDefinitions = null;

      var activityIds = filter.activityIds;

      if (!activityIds || !activityIds.length) {
        $scope.jobDefinitions = jobDefinitions;
        return;
      }

      var jobDefinitionSelection = [];

      angular.forEach(jobDefinitions, function(jobDefinition) {
        var activityId = jobDefinition.activityId;

        if (activityIds.indexOf(activityId) != -1) {
          jobDefinitionSelection.push(jobDefinition);
        }
      });

      $scope.jobDefinitions = jobDefinitionSelection;
    }

    $scope.jobDefinitionVars = {
      read: ['jobDefinition', 'processData', 'filter']
    };
    $scope.jobDefinitionActions = Views.getProviders({
      component: 'cockpit.jobDefinition.action'
    });

    $scope.getSearchQueryForSearchType = searchWidgetUtils.getSearchQueryForSearchType.bind(
      null,
      'activityIdIn'
    );
  }
];

var Configuration = function PluginConfiguration(ViewsProvider) {
  ViewsProvider.registerDefaultView('cockpit.processDefinition.runtime.tab', {
    id: 'job-definition-table',
    label: 'PLUGIN_JOB_DEFINITION_LABEL',
    template: template,
    controller: Controller,
    priority: 2
  });
};

Configuration.$inject = ['ViewsProvider'];

module.exports = Configuration;
