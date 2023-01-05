import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { InsightsService } from './insights.service';

@Injectable()
class InsightsServiceExposed extends InsightsService {
  _appInsights: ApplicationInsights | undefined;

  createInsights(router: Router): ApplicationInsights {
    return super.createInsights(router);
  }
}

describe('InsightsService', () => {
  let exposed: InsightsServiceExposed;
  let service: InsightsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [InsightsServiceExposed] });

    exposed = TestBed.inject(InsightsServiceExposed);
    service = exposed;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createInsights', () => {
    it('create the insights instance', () => {
      const result = exposed.createInsights({} as Router);
      expect(result).toBeTruthy();
    });
  });

  describe('with mocked insights instance', () => {
    let insightsMock: jasmine.SpyObj<ApplicationInsights>;
    let createInsightsSpy: jasmine.Spy;

    beforeEach(() => {
      insightsMock = jasmine.createSpyObj<ApplicationInsights>('ApplicationInsights', [
        'loadAppInsights',
        'startTrackPage',
        'stopTrackPage',
        'startTrackEvent',
        'stopTrackEvent',
      ]);

      createInsightsSpy = spyOn(exposed, 'createInsights').and.returnValue(insightsMock);

      service.init({} as Router);
    });

    it('should call expected methods', () => {
      expect(createInsightsSpy).toHaveBeenCalled();
      expect(insightsMock.loadAppInsights).toHaveBeenCalled();
      expect(exposed._appInsights).toBe(insightsMock);
    });

    describe('startTrackPage', () => {
      it('should call expected methods', () => {
        service.startTrackPage('name');
        expect(insightsMock.startTrackPage).toHaveBeenCalledWith('name');
      });
    });

    describe('stopTrackPage', () => {
      it('should call expected methods', () => {
        service.stopTrackPage('name');
        expect(insightsMock.stopTrackPage).toHaveBeenCalledWith('name', undefined, undefined, undefined);
      });
    });

    describe('startTrackEvent', () => {
      it('should call expected methods', () => {
        service.startTrackEvent('name');
        expect(insightsMock.startTrackEvent).toHaveBeenCalledWith('name');
      });
    });

    describe('stopTrackEvent', () => {
      it('should call expected methods', () => {
        service.stopTrackEvent('name');
        expect(insightsMock.stopTrackEvent).toHaveBeenCalledWith('name', undefined, undefined);
      });
    });
  });
});
